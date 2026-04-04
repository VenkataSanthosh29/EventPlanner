package com.edutech.dto;

public class ClientProfileDto {
    private Long id;
    private String username;
    private String email;
    private String role;

    private long acceptedRequests;

    public ClientProfileDto(Long id, String username, String email, String role, long acceptedRequests) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.acceptedRequests = acceptedRequests;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public long getAcceptedRequests() { return acceptedRequests; }
}