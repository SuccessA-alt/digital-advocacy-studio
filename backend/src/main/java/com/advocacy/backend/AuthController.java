package com.advocacy.backend;

import com.advocacy.backend.user.AppUserRepository;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository users;

    public AuthController(AppUserRepository users) {
        this.users = users;
    }

    public record AuthStatus(
            boolean authenticated,
            Long accountId,
            String name,
            String email
    ) {
    }

    @GetMapping("/me")
    public AuthStatus me(
            @AuthenticationPrincipal OidcUser user
    ) {
        if (user == null) {
            return new AuthStatus(false, null, null, null);
        }

        var account = users
                .findByGoogleSubject(user.getSubject())
                .orElse(null);

        if (account == null) {
            return new AuthStatus(false, null, null, null);
        }

        return new AuthStatus(
                true,
                account.getId(),
                user.getFullName(),
                user.getEmail()
        );
    }

    @GetMapping("/csrf")
    public CsrfToken csrf(CsrfToken token) {
        return token;
    }

    @GetMapping(
            value = "/complete",
            produces = MediaType.TEXT_HTML_VALUE
    )
    public String complete(
            @AuthenticationPrincipal OidcUser user,
            @RequestParam(name = "error", required = false)
            String error
    ) {
        boolean signedIn = error == null && me(user).authenticated();

        String heading = signedIn
                ? "You are signed in"
                : "Sign-in was not completed";

        String message = signedIn
                ? "You can close this tab and return to Digital Advocacy Studio."
                : "You can close this tab and try signing in again. "
                        + "Your campaign remains in your original app tab.";

        return """
                <!doctype html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport"
                          content="width=device-width, initial-scale=1">
                    <title>Digital Advocacy Studio — Sign in</title>
                </head>
                <body>
                    <main>
                        <h1>%s</h1>
                        <p>%s</p>
                    </main>
                    <script>
                        try {
                            const channel = new BroadcastChannel('digital-advocacy-auth');
                            channel.postMessage({
                                type: 'sign-in-complete',
                                success: %s
                            });
                            channel.close();
                        } catch (error) {
                            // Users can confirm sign-in from their original app tab.
                        }
                    </script>
                </body>
                </html>
                """.formatted(heading, message, signedIn);
    }
}