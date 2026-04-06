package com.edutech.controllers;

import com.edutech.dto.LoginRequest;
import com.edutech.dto.LoginResponse;
import com.edutech.dto.OtpRequest;
import com.edutech.dto.OtpVerifyRequest;
import com.edutech.dto.ResetPasswordRequestDto;
import com.edutech.entities.User;
import com.edutech.jwt.JwtUtil;
import com.edutech.services.EmailService;
import com.edutech.services.OtpService;
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

    //  Purpose constants for OTP (matches your OtpService design)
    private static final String PURPOSE_REGISTER = "REGISTER";
    private static final String PURPOSE_RESET_PASSWORD = "RESET_PASSWORD";

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

    //  Registration
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {
          if (!otpService.isOtpVerified(user.getEmail(), PURPOSE_REGISTER)) {
              return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
         }

        User registeredUser = userService.registerUser(user);

        //  Cleanup OTP (purpose-based)
        otpService.clearOtp(user.getEmail(), PURPOSE_REGISTER);

        return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
    }

    //  Login
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(@RequestBody LoginRequest loginRequest) {

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

    //  Live username existence check
    @GetMapping("/exists/username")
    public ResponseEntity<Boolean> usernameExists(@RequestParam String username) {
        boolean exists = userService.existsByUsername(username);
        return ResponseEntity.ok(exists);
    }

    //  Live email existence check
    @GetMapping("/exists/email")
    public ResponseEntity<Boolean> emailExists(@RequestParam String email) {
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }

    
    //  OTP FOR REGISTRATION (purpose = REGISTER)

    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestBody OtpRequest request) {
        String email= request.getEmail();
            if (userService.existsByEmail(email)) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Email Already Exists");
        }

        try {
            String otp = otpService.generateOrResendOtp(request.getEmail(), PURPOSE_REGISTER);

            //  Purpose-based email template
            emailService.sendOtpEmail(request.getEmail(), otp, PURPOSE_REGISTER);

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
                request.getOtp(),
                PURPOSE_REGISTER
        );

        if (!verified) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Invalid or expired OTP");
        }

        return ResponseEntity.ok("OTP verified");
    }

 
    //  FORGOT PASSWORD FLOW (purpose = RESET_PASSWORD)

    //  1) Send OTP for password reset
    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<String> sendResetOtp(@RequestBody OtpRequest request) {

        String email = request.getEmail();

        //  Only valid email -> send OTP
        if (!userService.existsByEmail(email)) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Invalid email");
        }

        try {
            String otp = otpService.generateOrResendOtp(email, PURPOSE_RESET_PASSWORD);

            //  Purpose-based email template
            emailService.sendOtpEmail(email, otp, PURPOSE_RESET_PASSWORD);

            return ResponseEntity.ok("OTP sent");
        } catch (IllegalStateException ex) {
            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(ex.getMessage());
        }
    }

    //  2) Verify OTP for password reset
    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<String> verifyResetOtp(@RequestBody OtpVerifyRequest request) {

        boolean verified = otpService.verifyOtp(
                request.getEmail(),
                request.getOtp(),
                PURPOSE_RESET_PASSWORD
        );

        if (!verified) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Invalid or expired OTP");
        }

        return ResponseEntity.ok("OTP verified");
    }

    //  3) Reset password (only after OTP verified)
    @PostMapping("/forgot-password/reset")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequestDto dto) {

        String email = dto.getEmail();

        if (!otpService.isOtpVerified(email, PURPOSE_RESET_PASSWORD)) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("OTP verification required");
        }

        userService.updatePasswordByEmail(email, dto.getNewPassword());

        //  cleanup OTP after success
        otpService.clearOtp(email, PURPOSE_RESET_PASSWORD);

        return ResponseEntity.ok("Password updated successfully");
    }
}