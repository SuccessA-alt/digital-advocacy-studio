package com.advocacy.backend.ai;

public class AiUsageLimitException extends RuntimeException {

    private final long retryAfterSeconds;

    public AiUsageLimitException(String message, long retryAfterSeconds) {
        super(message);
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}