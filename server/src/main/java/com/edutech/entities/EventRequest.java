package com.edutech.entities;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_requests")
public class EventRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long clientId;
    private String clientName;

    private Long plannerId;
    private String plannerName;

    private String eventType;
    private String preferredDate; // "yyyy-MM-ddTHH:mm"
    private String location;

    @Column(length = 2000)
    private String description;

    // ✅ New lifecycle:
    // PENDING → BUDGET_PROPOSED → AGREED → (event created) OR REJECTED
    private String status = "PENDING";

    // ✅ Budget lifecycle:
    // PENDING → BUDGET_PROPOSED → CLIENT_ACCEPTED / CLIENT_REJECTED
    private String budgetStatus = "PENDING";

    // store in rupees (1A)
    private Double budgetProposed;
    private Double finalBudget;

    private Long createdEventId;
    private Long paymentId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
        if (budgetStatus == null) budgetStatus = "PENDING";
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public Long getPlannerId() { return plannerId; }
    public void setPlannerId(Long plannerId) { this.plannerId = plannerId; }

    public String getPlannerName() { return plannerName; }
    public void setPlannerName(String plannerName) { this.plannerName = plannerName; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getPreferredDate() { return preferredDate; }
    public void setPreferredDate(String preferredDate) { this.preferredDate = preferredDate; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getBudgetStatus() { return budgetStatus; }
    public void setBudgetStatus(String budgetStatus) { this.budgetStatus = budgetStatus; }

    public Double getBudgetProposed() { return budgetProposed; }
    public void setBudgetProposed(Double budgetProposed) { this.budgetProposed = budgetProposed; }

    public Double getFinalBudget() { return finalBudget; }
    public void setFinalBudget(Double finalBudget) { this.finalBudget = finalBudget; }

    public Long getCreatedEventId() { return createdEventId; }
    public void setCreatedEventId(Long createdEventId) { this.createdEventId = createdEventId; }

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}