package com.advocacy.backend.campaign;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

@Entity
@Table(
    name = "campaign_versions",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_campaign_version_number",
        columnNames = {"campaign_id", "version_number"}
    )
)
public class CampaignVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "campaign_id", nullable = false, updatable = false)
    private Campaign campaign;

    @Column(name = "version_number", nullable = false, updatable = false)
    private int versionNumber;

    @Column(name = "saved_at", nullable = false, updatable = false)
    private Instant savedAt;

    @Column(nullable = false, length = 120, updatable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT", updatable = false)
    private String problem;

    @Column(name = "sdg_id", updatable = false)
    private Long sdgId;

    @Column(name = "sdg_goal_number", updatable = false)
    private Integer sdgGoalNumber;

    @Column(name = "sdg_name", length = 100, updatable = false)
    private String sdgName;

    @Column(
        name = "desired_outcome",
        nullable = false,
        columnDefinition = "TEXT",
        updatable = false
    )
    private String desiredOutcome;

    @Column(
        name = "core_message",
        nullable = false,
        columnDefinition = "TEXT",
        updatable = false
    )
    private String coreMessage;

    @Column(
        name = "sharing_method",
        nullable = false,
        columnDefinition = "TEXT",
        updatable = false
    )
    private String sharingMethod;

    @Column(
        name = "decision_maker",
        nullable = false,
        length = 255,
        updatable = false
    )
    private String decisionMaker;

    @Column(
        name = "advocacy_plan",
        nullable = false,
        columnDefinition = "TEXT",
        updatable = false
    )
    private String advocacyPlan;

    @Column(
        name = "success_measures",
        nullable = false,
        columnDefinition = "TEXT",
        updatable = false
    )
    private String successMeasures;

    protected CampaignVersion() {
    }

    public CampaignVersion(Campaign campaign, int versionNumber) {
        this.campaign = campaign;
        this.versionNumber = versionNumber;
        this.savedAt = Instant.now();

        this.title = campaign.getTitle();
        this.problem = campaign.getProblem();
        this.desiredOutcome = campaign.getDesiredOutcome();
        this.coreMessage = campaign.getCoreMessage();
        this.sharingMethod = campaign.getSharingMethod() == null
                ? ""
                : campaign.getSharingMethod();
        this.decisionMaker = campaign.getDecisionMaker();
        this.advocacyPlan = campaign.getAdvocacyPlan();
        this.successMeasures = campaign.getSuccessMeasures();

        if (campaign.getSdg() != null) {
            this.sdgId = campaign.getSdg().getId();
            this.sdgGoalNumber = campaign.getSdg().getGoalNumber();
            this.sdgName = campaign.getSdg().getName();
        }
    }

    public Long getId() { return id; }

    public Long getCampaignId() { return campaign.getId(); }

    public int getVersionNumber() { return versionNumber; }

    public Instant getSavedAt() { return savedAt; }

    public String getTitle() { return title; }

    public String getProblem() { return problem; }

    public Long getSdgId() { return sdgId; }

    public Integer getSdgGoalNumber() { return sdgGoalNumber; }

    public String getSdgName() { return sdgName; }

    public String getDesiredOutcome() { return desiredOutcome; }

    public String getCoreMessage() { return coreMessage; }

    public String getSharingMethod() { return sharingMethod; }

    public String getDecisionMaker() { return decisionMaker; }

    public String getAdvocacyPlan() { return advocacyPlan; }

    public String getSuccessMeasures() { return successMeasures; }
}