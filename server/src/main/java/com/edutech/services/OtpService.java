package com.edutech.services;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

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

    private String key(String email, String purpose) {
        return email + ":" + purpose;
    }

    //  Generate / resend OTP with purpose (REGISTER / RESET_PASSWORD)
    public String generateOrResendOtp(String email, String purpose) {

        String k = key(email, purpose);
        OtpDetails details = otpStore.get(k);

        if (details != null) {

            if (details.sendAttempts >= MAX_SEND_ATTEMPTS) {
                throw new IllegalStateException("OTP send limit exceeded");
            }

            if (details.lastSentTime != null &&
                details.lastSentTime.plusSeconds(RESEND_COOLDOWN_SECONDS)
                        .isAfter(LocalDateTime.now())) {

                throw new IllegalStateException("Please wait 30 seconds before resending OTP");
            }
        } else {
            details = new OtpDetails();
            otpStore.put(k, details);
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

    //  Verify OTP 
    public boolean verifyOtp(String email, String otp, String purpose) {

        String k = key(email, purpose);
        OtpDetails details = otpStore.get(k);
        if (details == null) return false;

        if (details.verified) return false;
        if (details.expiry.isBefore(LocalDateTime.now())) return false;

        if (details.verifyAttempts >= MAX_VERIFY_ATTEMPTS) return false;
        details.verifyAttempts++;

        if (!details.otp.equals(otp)) return false;

        details.verified = true;
        return true;
    }

    public boolean isOtpVerified(String email, String purpose) {
        OtpDetails details = otpStore.get(key(email, purpose));
        return details != null && details.verified;
    }

    public void clearOtp(String email, String purpose) {
        otpStore.remove(key(email, purpose));
    }
}