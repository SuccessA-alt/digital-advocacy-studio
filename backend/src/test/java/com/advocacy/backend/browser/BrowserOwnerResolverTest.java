package com.advocacy.backend.browser;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class BrowserOwnerResolverTest {

    // Public test fixtures, never real browser credentials.
    private static final String TEST_TOKEN = "0".repeat(64);
    private static final String TEST_HASH =
            "60e05bd1b195af2f94112fa7197a5c88289058840ce7c6df9693756bc6250f55";

    private final BrowserOwnerRepository ownerRepository =
            mock(BrowserOwnerRepository.class);

    private final BrowserOwnerResolver resolver =
            new BrowserOwnerResolver(
                    new BrowserTokenService(),
                    ownerRepository
            );

    @Test
    void rejectsMissingHistoryCookieEvenWhenOwnerIdIsSupplied() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addParameter("ownerId", "1");

        assertTrue(resolver.resolve(request).isEmpty());
        verifyNoInteractions(ownerRepository);
    }

    @Test
    void rejectsMalformedTokenWithoutDatabaseLookup() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie(
                BrowserOwnerResolver.COOKIE_NAME,
                "not-a-valid-token"
        ));

        assertTrue(resolver.resolve(request).isEmpty());
        verifyNoInteractions(ownerRepository);
    }

    @Test
    void rejectsDuplicateHistoryCookiesWithoutDatabaseLookup() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(
                new Cookie(BrowserOwnerResolver.COOKIE_NAME, TEST_TOKEN),
                new Cookie(
                        BrowserOwnerResolver.COOKIE_NAME,
                        "1".repeat(64)
                )
        );

        assertTrue(resolver.resolve(request).isEmpty());
        verifyNoInteractions(ownerRepository);
    }

    @Test
    void returnsNoOwnerWhenDatabaseHasNoValidMatch() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie(
                BrowserOwnerResolver.COOKIE_NAME,
                TEST_TOKEN
        ));

        when(ownerRepository.findByTokenHashAndExpiresAtAfter(
                eq(TEST_HASH),
                any(Instant.class)
        )).thenReturn(Optional.empty());

        assertTrue(resolver.resolve(request).isEmpty());

        verify(ownerRepository).findByTokenHashAndExpiresAtAfter(
                eq(TEST_HASH),
                any(Instant.class)
        );
    }

    @Test
    void resolvesMatchingOwnerUsingHashInsteadOfRawToken() {
        Instant now = Instant.now();
        BrowserOwner owner = new BrowserOwner(
                TEST_HASH,
                now,
                now.plusSeconds(3600)
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie(
                BrowserOwnerResolver.COOKIE_NAME,
                TEST_TOKEN
        ));

        when(ownerRepository.findByTokenHashAndExpiresAtAfter(
                eq(TEST_HASH),
                any(Instant.class)
        )).thenReturn(Optional.of(owner));

        assertSame(owner, resolver.resolve(request).orElseThrow());

        verify(ownerRepository).findByTokenHashAndExpiresAtAfter(
                eq(TEST_HASH),
                any(Instant.class)
        );
    }
}