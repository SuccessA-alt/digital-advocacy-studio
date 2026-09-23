package com.advocacy.backend.browser;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class BrowserTokenServiceTest {

    private final BrowserTokenService service =
            new BrowserTokenService();

    @Test
    void generatesWellFormedDistinctTokens() {
        String first = service.generateToken();
        String second = service.generateToken();

        assertTrue(first.matches("[0-9a-f]{64}"));
        assertTrue(second.matches("[0-9a-f]{64}"));
        assertFalse(first.equals(second));
        assertTrue(service.hashIfWellFormed(first).isPresent());
    }

    @Test
    void hashesAKnownTestValue() {
        // Public test fixture, never an actual browser credential.
        String testToken = "0".repeat(64);

        String hash = service.hashIfWellFormed(testToken)
                .orElseThrow();

        assertEquals(
                "60e05bd1b195af2f94112fa7197a5c88289058840ce7c6df9693756bc6250f55",
                hash
        );
    }

    @Test
    void rejectsMissingAndMalformedTokens() {
        assertTrue(service.hashIfWellFormed(null).isEmpty());

        for (String invalid : List.of(
                "",
                "not-a-token",
                "0".repeat(63),
                "0".repeat(65),
                "g".repeat(64),
                "A".repeat(64)
        )) {
            assertTrue(
                    service.hashIfWellFormed(invalid).isEmpty()
            );
        }
    }
}