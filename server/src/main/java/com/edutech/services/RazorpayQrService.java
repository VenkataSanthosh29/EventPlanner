package com.edutech.services;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class RazorpayQrService {

    @Value("${razorpay.keyId}")
    private String keyId;

    @Value("${razorpay.keySecret}")
    private String keySecret;

    private static final String QR_ENDPOINT = "https://api.razorpay.com/v1/payments/qr_codes";

    public JSONObject createUpiQr(long amountPaise, Long paymentId, Long eventId) {

        try {
            // -------- Headers --------
            RestTemplate rest = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Basic Auth (keyId:keySecret)
            String auth = keyId + ":" + keySecret;
            String base64Creds = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
            headers.add("Authorization", "Basic " + base64Creds);

            // -------- Body --------
            JSONObject notes = new JSONObject();
            notes.put("paymentId", paymentId);
            notes.put("eventId", eventId);

            JSONObject req = new JSONObject();
            req.put("type", "upi_qr");
            req.put("name", "Event Payment");
            req.put("usage", "single_use");
            req.put("fixed_amount", true);
            req.put("payment_amount", amountPaise);
            req.put("description", "Event payment via UPI QR");
            req.put("notes", notes);

            HttpEntity<String> entity = new HttpEntity<>(req.toString(), headers);

            ResponseEntity<String> response = rest.exchange(
                    QR_ENDPOINT,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            return new JSONObject(response.getBody());

        } catch (Exception ex) {
            throw new RuntimeException("Failed to create Razorpay QR: " + ex.getMessage(), ex);
        }
    }
}