package com.edutech.services;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class OtpService {

    private static class OtpDetails {
        String otp;
        LocalDateTime expiry;
        boolean verified;

        LocalDateTime lastSentTime;
        int sendAttempts;
        int verifyAttempts;
    }

    private final Map<String, OtpDetails> otpStore = new ConcurrentHashMap<>();
    private final Random random = new Random();

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int RESEND_COOLDOWN_SECONDS = 30;
    private static final int MAX_SEND_ATTEMPTS = 3;
    private static final int MAX_VERIFY_ATTEMPTS = 5;

    // ✅ Generate or Resend OTP
    public String generateOrResendOtp(String email) {

        OtpDetails details = otpStore.get(email);

        if (details != null) {

            // ❌ Too many send attempts
            if (details.sendAttempts >= MAX_SEND_ATTEMPTS) {
                throw new IllegalStateException("OTP send limit exceeded");
            }

            // ❌ Enforce 30s cooldown
            if (details.lastSentTime != null &&
                details.lastSentTime.plusSeconds(RESEND_COOLDOWN_SECONDS)
                    .isAfter(LocalDateTime.now())) {

                throw new IllegalStateException(
                    "Please wait 30 seconds before resending OTP"
                );
            }
        } else {
            details = new OtpDetails();
            otpStore.put(email, details);
        }

        String otp = String.valueOf(100000 + random.nextInt(900000));

        details.otp = otp;
        details.expiry = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
        details.verified = false;
        details.lastSentTime = LocalDateTime.now();
        details.sendAttempts++;
        details.verifyAttempts = 0;

        return otp;
    }

    // ✅ Verify OTP
    public boolean verifyOtp(String email, String otp) {

        OtpDetails details = otpStore.get(email);
        if (details == null) return false;

        // ❌ Expired
        if (details.expiry.isBefore(LocalDateTime.now())) return false;

        // ❌ Too many attempts
        if (details.verifyAttempts >= MAX_VERIFY_ATTEMPTS) return false;

        details.verifyAttempts++;

        if (!details.otp.equals(otp)) return false;

        details.verified = true;
        return true;
    }

    public boolean isOtpVerified(String email) {
        OtpDetails details = otpStore.get(email);
        return details != null && details.verified;
    }

    public void clearOtp(String email) {
        otpStore.remove(email);
    }
}