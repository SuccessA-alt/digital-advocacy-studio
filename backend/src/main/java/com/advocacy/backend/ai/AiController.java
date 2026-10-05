package com.advocacy.backend.ai;

import com.advocacy.backend.campaign.CampaignRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final OpenAiService openAiService;
    private final AiUsageService usage;
    private final AiVisitorService visitors;

    public AiController(
            OpenAiService openAiService,
            AiUsageService usage,
            AiVisitorService visitors) {
        this.openAiService = openAiService;
        this.usage = usage;
        this.visitors = visitors;
    }

    @PostMapping("/draft")
    public CampaignDraftResponse draftCampaign(
            @Valid @RequestBody CampaignDraftRequest request,
            @AuthenticationPrincipal OidcUser user,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        usage.reserve(visitors.bucketIds(user, httpRequest, httpResponse));
        return openAiService.draftCampaign(request);
    }

    // This older endpoint remains protected even without a button in the UI.
    @PostMapping("/review")
    public Map<String, String> reviewCampaign(
            @Valid @RequestBody CampaignRequest campaign,
            @AuthenticationPrincipal OidcUser user,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        usage.reserve(visitors.bucketIds(user, httpRequest, httpResponse));
        return Map.of("review", openAiService.reviewCampaign(campaign));
    }

    @ExceptionHandler(AiUsageLimitException.class)
    public ResponseEntity<Map<String, String>> handleUsageLimit(
            AiUsageLimitException exception) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header(HttpHeaders.RETRY_AFTER,
                        Long.toString(exception.getRetryAfterSeconds()))
                .body(Map.of("message", exception.getMessage()));
    }
}

