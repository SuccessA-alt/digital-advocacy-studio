package com.advocacy.backend.campaign;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

import java.time.LocalDateTime;

import com.advocacy.backend.sdg.Sdg;

@Entity
@Table(name = "campaigns")
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String problem;

    @ManyToOne
    @JoinColumn(name = "sdg_id")
    private Sdg sdg;

    @Column(name = "desired_outcome", nullable = false, columnDefinition = "TEXT")
    private String desiredOutcome;

    @Column(name = "core_message", nullable = false, columnDefinition = "TEXT")
    private String coreMessage;

    @Column(name = "sharing_method", nullable = false, columnDefinition = "TEXT")
    private String sharingMethod;

    @Column(name = "decision_maker", nullable = false, length = 255)
    private String decisionMaker;

    @Column(name = "first_moves", nullable = false, columnDefinition = "TEXT")
    private String firstMoves;

    @Column(name = "success_measures", nullable = false, columnDefinition = "TEXT")
    private String successMeasures;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Campaign() {
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getProblem() {
        return problem;
    }

    public void setProblem(String problem) {
        this.problem = problem;
    }

    public Sdg getSdg() {
        return sdg;
    }

    public void setSdg(Sdg sdg) {
        this.sdg = sdg;
    }

    public String getDesiredOutcome() {
        return desiredOutcome;
    }

    public void setDesiredOutcome(String desiredOutcome) {
        this.desiredOutcome = desiredOutcome;
    }

    public String getCoreMessage() {
        return coreMessage;
    }

    public void setCoreMessage(String coreMessage) {
        this.coreMessage = coreMessage;
    }

    public String getSharingMethod() {
        return sharingMethod;
    }

    public void setSharingMethod(String sharingMethod) {
        this.sharingMethod = sharingMethod;
    }

    public String getDecisionMaker() {
        return decisionMaker;
    }

    public void setDecisionMaker(String decisionMaker) {
        this.decisionMaker = decisionMaker;
    }

    public String getFirstMoves() {
        return firstMoves;
    }

    public void setFirstMoves(String firstMoves) {
        this.firstMoves = firstMoves;
    }

    public String getSuccessMeasures() {
        return successMeasures;
    }

    public void setSuccessMeasures(String successMeasures) {
        this.successMeasures = successMeasures;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
       }


    @PrePersist
public void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
}

@PreUpdate
public void onUpdate() {
    updatedAt = LocalDateTime.now();
}

}
