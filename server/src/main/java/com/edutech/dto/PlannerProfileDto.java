package com.edutech.dto;

public class PlannerProfileDto {

    private Long id;
    private String username;
    private String email;
    private String role;

    private long eventsPlanned;          // total
    private long selfCreatedEvents;      // planner-created manually
    private long clientEvents;           // created from client agreements
    private long paidClientEvents;       // clientEvents with payment SUCCESS
    private double revenueGenerated;     // sum(amount) for paid client events

    private double averageRating;

    public PlannerProfileDto() {}

    public PlannerProfileDto(Long id, String username, String email, String role,
                             long eventsPlanned, long selfCreatedEvents, long clientEvents,
                             long paidClientEvents, double revenueGenerated, double averageRating) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.eventsPlanned = eventsPlanned;
        this.selfCreatedEvents = selfCreatedEvents;
        this.clientEvents = clientEvents;
        this.paidClientEvents = paidClientEvents;
        this.revenueGenerated = revenueGenerated;
        this.averageRating = averageRating;
    }

public PlannerProfileDto(Long id, String username, double averageRating) {
    this.id = id;
    this.username = username;
    this.averageRating = averageRating;
}
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getRole() { return role; }

    public long getEventsPlanned() { return eventsPlanned; }
    public long getSelfCreatedEvents() { return selfCreatedEvents; }
    public long getClientEvents() { return clientEvents; }
    public long getPaidClientEvents() { return paidClientEvents; }
    public double getRevenueGenerated() { return revenueGenerated; }
    public double getAverageRating() { return averageRating; }

    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setEmail(String email) { this.email = email; }
    public void setRole(String role) { this.role = role; }
    public void setEventsPlanned(long eventsPlanned) { this.eventsPlanned = eventsPlanned; }
    public void setSelfCreatedEvents(long selfCreatedEvents) { this.selfCreatedEvents = selfCreatedEvents; }
    public void setClientEvents(long clientEvents) { this.clientEvents = clientEvents; }
    public void setPaidClientEvents(long paidClientEvents) { this.paidClientEvents = paidClientEvents; }
    public void setRevenueGenerated(double revenueGenerated) { this.revenueGenerated = revenueGenerated; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
}