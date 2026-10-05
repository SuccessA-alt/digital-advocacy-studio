package com.advocacy.backend.ai;

import com.advocacy.backend.user.AppUserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AiVisitorService {

    private static final String COOKIE_NAME = "ADVOCACY_VISITOR";
    private static final Pattern UUID_PATTERN = Pattern.compile(
            "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}");

    private final AppUserRepository users;
    private final boolean secureCookie;

    public AiVisitorService(
            AppUserRepository users,
            @Value("${app.base-url:http://localhost:5173}") String appBaseUrl) {
        this.users = users;
        this.secureCookie = "https".equalsIgnoreCase(
                URI.create(appBaseUrl).getScheme());
    }

    public List<String> bucketIds(
            OidcUser user,
            HttpServletRequest request,
            HttpServletResponse response) {
        String visitorId = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                String value = cookie.getValue();
                if (COOKIE_NAME.equals(cookie.getName())
                        && value != null
                        && UUID_PATTERN.matcher(value).matches()) {
                    visitorId = value;
                    break;
                }
            }
        }

        if (visitorId == null) {
            visitorId = UUID.randomUUID().toString();
            ResponseCookie cookie = ResponseCookie
                    .from(COOKIE_NAME, visitorId)
                    .httpOnly(true)
                    .secure(secureCookie)
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(Duration.ofDays(365))
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }

        List<String> ids = new ArrayList<>();
        ids.add("guest:" + visitorId);

        // Signed-in visitors also have an account allowance shared across
        // browsers. Keeping the browser bucket means signing in or out does
        // not reset this browser's allowance.
        if (user != null) {
            var account = users.findByGoogleSubject(user.getSubject())
                    .orElseThrow(() -> new IllegalStateException(
                            "Your account could not be found. Please sign in again."));
            ids.add("account:" + account.getId());
        }

        return List.copyOf(ids);
    }
}