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
import com.edutech.dto.OtpRequest;
import com.edutech.dto.OtpVerifyRequest;
import com.edutech.services.EmailService;
import com.edutech.services.OtpService;


@RestController
@RequestMapping("/api/user")
public class RegisterAndLoginController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuthenticationManager authenticationManager;

    // ✅ EXISTING — Registration
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {

    if (!otpService.isOtpVerified(user.getEmail())) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(null);
    }

    User registeredUser = userService.registerUser(user);

    otpService.clearOtp(user.getEmail()); // cleanup

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
    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestBody OtpRequest request) {

    try {
        String otp = otpService.generateOrResendOtp(request.getEmail());
        emailService.sendOtpEmail(request.getEmail(), otp);
        return ResponseEntity.ok("OTP sent successfully");
    } catch (IllegalStateException ex) {
        return ResponseEntity
            .status(HttpStatus.TOO_MANY_REQUESTS)
            .body(ex.getMessage());
    }
}
@PostMapping("/verify-otp")
public ResponseEntity<String> verifyOtp(@RequestBody OtpVerifyRequest request) {

    boolean verified = otpService.verifyOtp(
        request.getEmail(),
        request.getOtp()
    );

    if (!verified) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body("Invalid or expired OTP");
    }

    return ResponseEntity.ok("OTP verified");
}
}