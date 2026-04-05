package com.edutech.controllers;

import com.edutech.services.PaymentService;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments/razorpay")
public class RazorpayWebhookController {

    private final PaymentService paymentService;

    @Value("${razorpay.webhookSecret}")
    private String webhookSecret;

    public RazorpayWebhookController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature
    ) {
        try {
            boolean ok = Utils.verifyWebhookSignature(payload, signature, webhookSecret);
            if (!ok) return ResponseEntity.status(400).body("Invalid signature");

            JSONObject json = new JSONObject(payload);
            String event = json.optString("event");

            JSONObject paymentEntity = json.getJSONObject("payload")
                    .getJSONObject("payment")
                    .getJSONObject("entity");

            String razorpayPaymentId = paymentEntity.optString("id");
            String qrId = paymentEntity.optString("qr_code_id");

            if (qrId == null || qrId.isBlank()) {
                return ResponseEntity.ok("No qr_code_id, ignored");
            }

            if ("payment.captured".equals(event)) {
                paymentService.markSuccessByQr(qrId, razorpayPaymentId);
            } else if ("payment.failed".equals(event)) {
                paymentService.markFailedByQr(qrId, razorpayPaymentId);
            }

            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Webhook error");
        }
    }
}