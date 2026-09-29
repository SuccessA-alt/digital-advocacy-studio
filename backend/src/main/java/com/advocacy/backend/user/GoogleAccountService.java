package com.advocacy.backend.user;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class GoogleAccountService
        implements OAuth2UserService<OidcUserRequest, OidcUser> {

    private final OidcUserService googleUserService = new OidcUserService();
    private final AppUserRepository users;
    private final TransactionTemplate transactions;

    public GoogleAccountService(
            AppUserRepository users,
            PlatformTransactionManager transactionManager
    ) {
        this.users = users;
        this.transactions = new TransactionTemplate(transactionManager);
    }

    @Override
    public OidcUser loadUser(OidcUserRequest request) {
        if (!"google".equals(
                request.getClientRegistration().getRegistrationId())) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("unsupported_provider"),
                    "This sign-in service supports Google."
            );
        }

        OidcUser googleUser = googleUserService.loadUser(request);

        String subject = googleUser.getSubject();
        String email = googleUser.getEmail();

        if (subject == null || subject.isBlank()
                || subject.length() > 255
                || email == null || email.isBlank()
                || email.length() > 254
                || !Boolean.TRUE.equals(googleUser.getEmailVerified())) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("invalid_google_identity"),
                    "A verified Google email address is required."
            );
        }

        try {
            createAccountIfMissing(subject, email);
        } catch (DataAccessException exception) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("account_unavailable"),
                    "Your account could not be prepared. Please try again.",
                    exception
            );
        }

        return googleUser;
    }

    private void createAccountIfMissing(
            String subject,
            String email
    ) {
        try {
            transactions.executeWithoutResult(status -> {
                if (users.findByGoogleSubject(subject).isEmpty()) {
                    users.saveAndFlush(
                            AppUser.forGoogle(subject, email)
                    );
                }
            });
        } catch (DataIntegrityViolationException exception) {
            // Another simultaneous sign-in may have created this account.
            // Check after the failed transaction has rolled back.
            if (users.findByGoogleSubject(subject).isEmpty()) {
                throw exception;
            }
        }
    }
}