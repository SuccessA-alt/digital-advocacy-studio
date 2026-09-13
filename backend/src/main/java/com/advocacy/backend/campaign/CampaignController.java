package com.advocacy.backend.campaign;

import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {

    private final CampaignService campaignService;
    private final CampaignPdfService campaignPdfService;

    public CampaignController(
            CampaignService campaignService,
            CampaignPdfService campaignPdfService) {

        this.campaignService = campaignService;
        this.campaignPdfService = campaignPdfService;
    }

    @PostMapping
    public ResponseEntity<Campaign> createCampaign(
            @Valid @RequestBody CampaignRequest request) {

        Campaign createdCampaign =
                campaignService.createCampaign(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdCampaign);
    }

    @GetMapping
    public List<Campaign> getAllCampaigns() {
        return campaignService.getAllCampaigns();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Campaign> getCampaignById(
            @PathVariable Long id) {

        return campaignService
                .getCampaignById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Campaign> updateCampaign(
            @PathVariable Long id,
            @Valid @RequestBody CampaignRequest request) {

        return campaignService
                .updateCampaign(id, request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampaign(
            @PathVariable Long id) {

        boolean deleted = campaignService.deleteCampaign(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    @GetMapping(
            value = "/{id}/pdf",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<byte[]> downloadCampaignPdf(
            @PathVariable Long id) {

        Campaign campaign = campaignService
                .getCampaignById(id)
                .orElse(null);

        if (campaign == null) {
            return ResponseEntity.notFound().build();
        }

        return pdfDownload(
                campaignPdfService.createCampaignPdf(campaign),
                "campaign-" + id + ".pdf"
        );
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<List<CampaignVersion>> getCampaignVersions(
            @PathVariable Long id) {

        return campaignService
                .getCampaignVersions(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/versions/{versionId}")
    public ResponseEntity<CampaignVersion> getCampaignVersion(
            @PathVariable Long id,
            @PathVariable Long versionId) {

        return campaignService
                .getCampaignVersion(id, versionId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping(
            value = "/{id}/versions/{versionId}/pdf",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<byte[]> downloadCampaignVersionPdf(
            @PathVariable Long id,
            @PathVariable Long versionId) {

        CampaignVersion version = campaignService
                .getCampaignVersion(id, versionId)
                .orElse(null);

        if (version == null) {
            return ResponseEntity.notFound().build();
        }

        return pdfDownload(
                campaignPdfService.createCampaignVersionPdf(version),
                "campaign-" + id
                        + "-version-" + version.getVersionNumber()
                        + ".pdf"
        );
    }

    private ResponseEntity<byte[]> pdfDownload(
            byte[] pdf,
            String filename) {

        return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\""
                )
                .body(pdf);
    }
}