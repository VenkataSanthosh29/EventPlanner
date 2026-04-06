package com.edutech.config;

import com.razorpay.RazorpayClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RazorpayConfig {

    @Value("${razorpay.keyId}")
    private String keyId;

    @Value("${razorpay.keySecret}")
    private String keySecret;

    @Bean
    public RazorpayClient razorpayClient() throws Exception {

        // HARD LOCK: demo/test only
        if (keyId == null || !keyId.startsWith("rzp_test_")) {
            throw new IllegalStateException("Demo mode: Only rzp_test_ keys are allowed");
        }

        return new RazorpayClient(keyId, keySecret);
    }
}