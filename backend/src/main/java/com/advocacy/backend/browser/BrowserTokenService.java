package com.advocacy.backend.browser;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public final class BrowserTokenService {

    private static final int TOKEN_BYTES = 32;
    private static final Pattern TOKEN_FORMAT =
            Pattern.compile("[0-9a-f]{64}");

    private final SecureRandom secureRandom = new SecureRandom();

    public String generateToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    public Optional<String> hashIfWellFormed(String token) {
        if (token == null
                || token.length() != TOKEN_BYTES * 2
                || !TOKEN_FORMAT.matcher(token).matches()) {
            return Optional.empty();
        }

        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );

            return Optional.of(HexFormat.of().formatHex(hash));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 is unavailable",
                    exception
            );
        }
    }
}