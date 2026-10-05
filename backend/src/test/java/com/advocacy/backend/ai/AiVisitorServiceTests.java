package com.advocacy.backend.ai;

import com.advocacy.backend.user.AppUser;
import com.advocacy.backend.user.AppUserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AiVisitorServiceTests {

    @Test
    void aGuestCanReuseTheirCookieWithoutSigningIn() {
        var users = mock(AppUserRepository.class);
        var visitors = new AiVisitorService(users, "http://localhost:5173");
        var response = new MockHttpServletResponse();

        var first = visitors.bucketIds(null, new MockHttpServletRequest(), response);
        assertEquals(1, first.size());
        assertTrue(response.getHeader("Set-Cookie").contains("HttpOnly"));
        assertTrue(response.getHeader("Set-Cookie").contains("SameSite=Lax"));

        var nextRequest = new MockHttpServletRequest();
        nextRequest.setCookies(new Cookie(
                "ADVOCACY_VISITOR", first.getFirst().substring("guest:".length())));
        assertEquals(first, visitors.bucketIds(
                null, nextRequest, new MockHttpServletResponse()));
        verifyNoInteractions(users);
    }

    @Test
    void aSignedInVisitorKeepsTheBrowserAndAccountIdentities() {
        var users = mock(AppUserRepository.class);
        var user = mock(OidcUser.class);
        var account = mock(AppUser.class);
        when(user.getSubject()).thenReturn("google-subject");
        when(account.getId()).thenReturn(7L);
        when(users.findByGoogleSubject("google-subject"))
                .thenReturn(Optional.of(account));

        var visitors = new AiVisitorService(users, "https://example.test");
        var response = new MockHttpServletResponse();
        var ids = visitors.bucketIds(user, new MockHttpServletRequest(), response);

        assertEquals(2, ids.size());
        assertTrue(ids.getFirst().startsWith("guest:"));
        assertEquals("account:7", ids.get(1));
        assertTrue(response.getHeader("Set-Cookie").contains("Secure"));
    }

    @Test
    void anInvalidCookieIsReplacedWithANewGuestIdentity() {
        var visitors = new AiVisitorService(
                mock(AppUserRepository.class), "http://localhost:5173");
        var request = new MockHttpServletRequest();
        request.setCookies(new Cookie("ADVOCACY_VISITOR", "global"));
        var response = new MockHttpServletResponse();

        var ids = visitors.bucketIds(null, request, response);
        assertNotEquals("guest:global", ids.getFirst());
        assertNotNull(response.getHeader("Set-Cookie"));
    }
}
