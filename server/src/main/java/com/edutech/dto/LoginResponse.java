package com.edutech.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginResponse {
    private String token;
    private String roles;
    private Integer userId;
    @JsonCreator
    public LoginResponse(@JsonProperty("token") String token, String roles, Integer userId) {
        this.token = token;
        this.roles = roles;
        this.userId = userId;
    }
    public String getToken() {
        return token;
    }
    public void setToken(String token) {
        this.token = token;
    }
    public String getRoles() {
        return roles;
    }
    public void setRoles(String roles) {
        this.roles = roles;
    }
    public Integer getUserId() {
        return userId;
    }
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
}
