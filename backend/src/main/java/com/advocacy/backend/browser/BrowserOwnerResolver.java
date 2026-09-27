package com.advocacy.backend.browser;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
public class BrowserOwnerResolver {

    public static final String COOKIE_NAME = "das_campaign_browser";

    private final BrowserTokenService tokenService;
    private final BrowserOwnerRepository ownerRepository;

    public BrowserOwnerResolver(
            BrowserTokenService tokenService,
            BrowserOwnerRepository ownerRepository) {

        this.tokenService = tokenService;
        this.ownerRepository = ownerRepository;
    }

    @Transactional(readOnly = true)
    public Optional<BrowserOwner> resolve(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return Optional.empty();
        }

        Cookie historyCookie = null;

        for (Cookie cookie : cookies) {
            if (!COOKIE_NAME.equals(cookie.getName())) {
                continue;
            }

            // Reject ambiguous requests containing this cookie twice.
            if (historyCookie != null) {
                return Optional.empty();
            }

            historyCookie = cookie;
        }

        if (historyCookie == null) {
            return Optional.empty();
        }

        Optional<String> tokenHash =
                tokenService.hashIfWellFormed(historyCookie.getValue());

        if (tokenHash.isEmpty()) {
            return Optional.empty();
        }

        return ownerRepository.findByTokenHashAndExpiresAtAfter(
                tokenHash.get(),
                Instant.now()
        );
    }
}
