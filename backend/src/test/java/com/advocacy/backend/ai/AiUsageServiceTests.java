package com.advocacy.backend.ai;

import com.advocacy.backend.campaign.CampaignRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.transaction.PlatformTransactionManager;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SpringBootTest(properties =
        "spring.datasource.url=jdbc:h2:mem:ai_usage_tests;MODE=MySQL;DB_CLOSE_DELAY=-1")
class AiUsageServiceTests {

    private static final Instant START = Instant.parse("2026-01-01T12:00:00Z");

    @Autowired
    private AiUsageBucketRepository buckets;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private Clock clock;
    private AiUsageService usage;

    @BeforeEach
    void prepare() {
        // Only the dedicated in-memory test database is changed.
        buckets.deleteAll();
        clock = mock(Clock.class);
        when(clock.instant()).thenReturn(START);
        usage = new AiUsageService(buckets, transactionManager, 2, 3, clock);
        usage.initializeGlobalBucket();
    }

    @Test
    void visitorLimitRejectsWithoutConsumingTheSharedAllowance() {
        usage.reserve(List.of("guest:a"));
        usage.reserve(List.of("guest:a"));
        assertThrows(AiUsageLimitException.class,
                () -> usage.reserve(List.of("guest:a")));

        usage.reserve(List.of("guest:b"));
        assertThrows(AiUsageLimitException.class,
                () -> usage.reserve(List.of("guest:c")));
        assertFalse(buckets.existsById("guest:c"));
    }

    @Test
    void usesARollingHourRatherThanResettingAllRequestsTogether() {
        usage.reserve(List.of("guest:a"));
        when(clock.instant()).thenReturn(START.plus(Duration.ofMinutes(30)));
        usage.reserve(List.of("guest:a"));

        when(clock.instant()).thenReturn(START.plus(Duration.ofMinutes(59)));
        assertThrows(AiUsageLimitException.class,
                () -> usage.reserve(List.of("guest:a")));

        when(clock.instant()).thenReturn(START.plus(Duration.ofHours(1)));
        usage.reserve(List.of("guest:a"));
        assertThrows(AiUsageLimitException.class,
                () -> usage.reserve(List.of("guest:a")));
    }

    @Test
    void aNewServiceInstanceKeepsTheExistingDatabaseAllowance() {
        usage.reserve(List.of("guest:a"));
        usage.reserve(List.of("guest:a"));

        AiUsageService restarted = new AiUsageService(
                buckets, transactionManager, 2, 3, clock);
        restarted.initializeGlobalBucket();
        assertThrows(AiUsageLimitException.class,
                () -> restarted.reserve(List.of("guest:a")));
    }

    @Test
    void anAccountSharesItsAllowanceAcrossBrowsers() {
        usage.reserve(List.of("guest:a", "account:7"));
        usage.reserve(List.of("guest:b", "account:7"));
        assertThrows(AiUsageLimitException.class,
                () -> usage.reserve(List.of("guest:c", "account:7")));

        // The refused request did not charge the guest or shared counter.
        usage.reserve(List.of("guest:c"));
    }

    @Test
    void signingInDoesNotResetTheExistingBrowserAllowance() {
        usage.reserve(List.of("guest:a"));
        usage.reserve(List.of("guest:a"));
        assertThrows(AiUsageLimitException.class,
                () -> usage.reserve(List.of("guest:a", "account:7")));
    }

    @Test
    void simultaneousRequestsCannotExceedTheSharedAllowance() throws Exception {
        var executor = Executors.newFixedThreadPool(8);
        CountDownLatch start = new CountDownLatch(1);
        List<Future<Boolean>> results = new ArrayList<>();
        try {
            for (int i = 0; i < 8; i++) {
                String id = "guest:parallel-" + i;
                results.add(executor.submit(() -> {
                    start.await();
                    try {
                        usage.reserve(List.of(id));
                        return true;
                    } catch (AiUsageLimitException exception) {
                        return false;
                    }
                }));
            }
            start.countDown();
            int accepted = 0;
            for (Future<Boolean> result : results) {
                if (result.get(20, TimeUnit.SECONDS)) {
                    accepted++;
                }
            }
            assertEquals(3, accepted);
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    void removesExpiredVisitorRecords() {
        usage.reserve(List.of("guest:old"));
        when(clock.instant()).thenReturn(
                START.plus(Duration.ofHours(1)).plusSeconds(1));
        usage.reserve(List.of("guest:new"));

        assertFalse(buckets.existsById("guest:old"));
        assertTrue(buckets.existsById("global"));
        assertTrue(buckets.existsById("guest:new"));
    }

    @Test
    void draftAndReviewShareAnAllowanceAndReturnARetryTime() {
        OpenAiService openAi = mock(OpenAiService.class);
        AiVisitorService visitors = mock(AiVisitorService.class);
        when(visitors.bucketIds(isNull(), any(), any()))
                .thenReturn(List.of("guest:a"));
        when(openAi.reviewCampaign(any())).thenReturn("Mock review");
        AiController controller = new AiController(openAi, usage, visitors);
        var request = new MockHttpServletRequest();
        var response = new MockHttpServletResponse();
        var draft = new CampaignDraftRequest("A test problem", null);
        var campaign = new CampaignRequest();

        controller.draftCampaign(draft, null, request, response);
        controller.reviewCampaign(campaign, null, request, response);
        AiUsageLimitException blocked = assertThrows(AiUsageLimitException.class,
                () -> controller.draftCampaign(draft, null, request, response));

        verify(openAi, times(1)).draftCampaign(draft);
        verify(openAi, times(1)).reviewCampaign(campaign);
        var result = controller.handleUsageLimit(blocked);
        assertEquals(429, result.getStatusCode().value());
        assertEquals("3600", result.getHeaders().getFirst("Retry-After"));
        assertNotNull(result.getBody().get("message"));
    }

    @Test
    void upstreamFailuresStillUseTheReservedAllowance() {
        OpenAiService openAi = mock(OpenAiService.class);
        AiVisitorService visitors = mock(AiVisitorService.class);
        when(visitors.bucketIds(isNull(), any(), any()))
                .thenReturn(List.of("guest:a"));
        when(openAi.draftCampaign(any()))
                .thenThrow(new IllegalStateException("Simulated timeout"));
        AiController controller = new AiController(openAi, usage, visitors);
        var request = new MockHttpServletRequest();
        var response = new MockHttpServletResponse();
        var draft = new CampaignDraftRequest("A test problem", null);

        for (int i = 0; i < 2; i++) {
            assertThrows(IllegalStateException.class,
                    () -> controller.draftCampaign(draft, null, request, response));
        }
        assertThrows(AiUsageLimitException.class,
                () -> controller.draftCampaign(draft, null, request, response));
        verify(openAi, times(2)).draftCampaign(draft);
    }
}