package com.edutech.dto;

public class PlannerProfileDto {
    private Long id;
    private String username;
    private String email;
    private String role;

    private long eventsPlanned;
    private double averageRating;

    public PlannerProfileDto(Long id, String username, String email, String role,
                             long eventsPlanned, double averageRating) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.eventsPlanned = eventsPlanned;
        this.averageRating = averageRating;
    }

       public PlannerProfileDto(Long plannerId, String plannerName, double averageRating) {
        this.id = plannerId;
        this.username = plannerName;
        this.averageRating = averageRating;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public long getEventsPlanned() { return eventsPlanned; }
    public double getAverageRating() { return averageRating; }
}