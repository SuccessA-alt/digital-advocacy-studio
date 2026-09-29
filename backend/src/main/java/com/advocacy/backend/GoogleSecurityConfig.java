package com.advocacy.backend;

import com.advocacy.backend.user.GoogleAccountService;
import jakarta.servlet.DispatcherType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class GoogleSecurityConfig {

    @Bean
    public SecurityFilterChain googleSignInSecurity(
            HttpSecurity http,
            GoogleAccountService googleAccountService,
            @Value("${app.base-url}") String appBaseUrl
    ) throws Exception {
        http
                .authorizeHttpRequests(authorize -> authorize
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                        .requestMatchers(
                                "/oauth2/**",
                                "/login/oauth2/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/auth/me",
                                "/api/auth/csrf",
                                "/api/auth/complete",
                                "/api/sdgs",
                                "/api/sdgs/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/api/auth/logout",
                                "/api/ai/draft",
                                "/api/ai/review",
                                "/api/campaigns/draft/pdf"
                        ).permitAll()
                        .requestMatchers(
                                "/api/campaigns",
                                "/api/campaigns/**"
                        ).authenticated()
                        .anyRequest().denyAll()
                )
                .requestCache(cache -> cache.disable())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            response.getWriter().write(
                                    "{\"message\":\"Please sign in to access saved campaigns.\"}"
                            );
                        })
                        .accessDeniedHandler((request, response, exception) -> {
                            response.setStatus(403);
                            response.setContentType("application/json");
                            response.getWriter().write(
                                    "{\"message\":\"This request was not accepted. Please try again.\"}"
                            );
                        })
                )
                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(userInfo -> userInfo
                                .oidcUserService(googleAccountService)
                        )
                        .loginPage("/oauth2/authorization/google")
                        .defaultSuccessUrl(
                                appBaseUrl + "/api/auth/complete", true
                        )
                        .failureUrl(
                                appBaseUrl + "/api/auth/complete?error=login_failed"
                        )
                )
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                        .logoutSuccessHandler((request, response, authentication) ->
                                response.setStatus(204)
                        )
                );

        return http.build();
    }
}