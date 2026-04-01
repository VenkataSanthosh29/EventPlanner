package com.edutech.controllers;

import com.edutech.dto.LoginRequest;
import com.edutech.dto.LoginResponse;
import com.edutech.entities.User;
import com.edutech.jwt.JwtUtil;
import com.edutech.services.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/user")
public class RegisterAndLoginController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    // ✅ EXISTING — Registration
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {
        User registeredUser = userService.registerUser(user);
        return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
    }

    // ✅ EXISTING — Login
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(
            @RequestBody LoginRequest loginRequest) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid username or password",
                    e
            );
        }

        User user = userService.getUserByUsername(loginRequest.getUsername());
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());

        LoginResponse response =
                new LoginResponse(token, user.getRole(), user.getId().intValue());

        return ResponseEntity.ok(response);
    }

    // ✅ NEW — Live username existence check
    @GetMapping("/exists/username")
    public ResponseEntity<Boolean> usernameExists(
            @RequestParam String username) {

        boolean exists = userService.existsByUsername(username);
        return ResponseEntity.ok(exists);
    }

    // ✅ NEW — Live email existence check
    @GetMapping("/exists/email")
    public ResponseEntity<Boolean> emailExists(
            @RequestParam String email) {

        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }
}