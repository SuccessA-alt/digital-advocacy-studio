package com.advocacy.backend.ai;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class AiUsageService {

    private static final String GLOBAL_ID = "global";
    private static final Duration WINDOW = Duration.ofHours(1);

    private final AiUsageBucketRepository buckets;
    private final TransactionTemplate transactions;
    private final int visitorLimit;
    private final int totalLimit;
    private final Clock clock;

    @Autowired
    public AiUsageService(
            AiUsageBucketRepository buckets,
            PlatformTransactionManager transactionManager,
            @Value("${app.ai.visitor-hourly-limit:20}") int visitorLimit,
            @Value("${app.ai.total-hourly-limit:400}") int totalLimit) {
        this(buckets, transactionManager, visitorLimit, totalLimit,
                Clock.systemUTC());
    }

    // An injectable clock also lets tests check expiry without waiting an hour.
    AiUsageService(
            AiUsageBucketRepository buckets,
            PlatformTransactionManager transactionManager,
            int visitorLimit,
            int totalLimit,
            Clock clock) {
        if (visitorLimit < 1 || totalLimit < 1) {
            throw new IllegalArgumentException("AI limits must be positive.");
        }
        this.buckets = buckets;
        this.visitorLimit = visitorLimit;
        this.totalLimit = totalLimit;
        this.clock = clock;
        this.transactions = new TransactionTemplate(transactionManager);
        this.transactions.setPropagationBehavior(
                TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    @PostConstruct
    public void initializeGlobalBucket() {
        try {
            transactions.executeWithoutResult(status -> {
                if (!buckets.existsById(GLOBAL_ID)) {
                    buckets.saveAndFlush(
                            new AiUsageBucket(GLOBAL_ID, clock.instant()));
                }
            });
        } catch (DataIntegrityViolationException exception) {
            // Another backend instance may have created the same row.
            // Check only after the failed transaction has rolled back.
            if (!buckets.existsById(GLOBAL_ID)) {
                throw exception;
            }
        }
    }

    public void reserve(List<String> visitorIds) {
        if (visitorIds == null || visitorIds.isEmpty()
                || visitorIds.stream().anyMatch(id ->
                        id == null || id.length() > 100
                                || !(id.startsWith("guest:")
                                || id.startsWith("account:")))) {
            throw new IllegalArgumentException("Could not identify the visitor.");
        }

        transactions.executeWithoutResult(status -> {
            // Every request takes this lock first. Multiple requests or backend
            // instances therefore cannot reserve the same remaining allowance.
            AiUsageBucket global = buckets.findByIdForUpdate(GLOBAL_ID)
                    .orElseThrow(() -> new IllegalStateException(
                            "AI usage tracking is unavailable. Please try again."));

            Instant now = clock.instant();
            Instant cutoff = now.minus(WINDOW);
            global.discardExpired(cutoff);
            requireSpace(global, totalLimit, now,
                    "The app's shared hourly AI allowance has been reached.");

            List<AiUsageBucket> visitors = new ArrayList<>();
            for (String id : visitorIds.stream().distinct().toList()) {
                AiUsageBucket visitor = buckets.findById(id)
                        .orElseGet(() -> new AiUsageBucket(id, now));
                visitor.discardExpired(cutoff);
                requireSpace(visitor, visitorLimit, now,
                        "You have reached your hourly AI allowance of "
                                + visitorLimit + " requests.");
                visitors.add(visitor);
            }

            // Record an attempt only after EVERY applicable limit passes.
            for (AiUsageBucket visitor : visitors) {
                visitor.recordRequest(now);
                buckets.save(visitor);
            }
            global.recordRequest(now);
            buckets.save(global);

            // Flush the new timestamps before selecting inactive records.
            buckets.flush();
            buckets.deleteAll(
                    buckets.findByIdNotAndLastUsedAtBefore(GLOBAL_ID, cutoff));
        });
        // The transaction has committed before the controller calls OpenAI.
        // Failed AI calls still count: a timeout may already have incurred cost.
    }

    private void requireSpace(
            AiUsageBucket bucket, int limit, Instant now, String message) {
        List<Instant> times = bucket.getRequestTimes();
        if (times.size() < limit) {
            return;
        }

        // Also handles a limit lowered below the number of existing attempts.
        Instant availableAt = times.stream().sorted().toList()
                .get(times.size() - limit).plus(WINDOW);
        long seconds = Math.max(1,
                (Duration.between(now, availableAt).toMillis() + 999) / 1000);
        long minutes = (seconds + 59) / 60;

        throw new AiUsageLimitException(
                message + " Try again in about " + minutes
                        + (minutes == 1 ? " minute." : " minutes."),
                seconds);
    }
}