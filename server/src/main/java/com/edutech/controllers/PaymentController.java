package com.edutech.controllers;

import com.edutech.entities.Payment;
import com.edutech.services.PaymentService;
import com.razorpay.RazorpayException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/{paymentId}/razorpay/qr")
    public ResponseEntity<Payment> createQr(
            @PathVariable Long paymentId,
            @RequestParam Long clientId
    ) throws RazorpayException {
        return ResponseEntity.ok(paymentService.createQrForPayment(paymentId, clientId));
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<Payment> getPayment(
            @PathVariable Long paymentId,
            @RequestParam Long clientId
    ) {
        return ResponseEntity.ok(paymentService.getPayment(paymentId, clientId));
    }

    @GetMapping
    public ResponseEntity<List<Payment>> getMyPayments(@RequestParam Long clientId) {
        return ResponseEntity.ok(paymentService.getPaymentsForClient(clientId));
    }

@PostMapping("/{paymentId}/demo-success")
public ResponseEntity<String> demoSuccess(
        @PathVariable Long paymentId,
        @RequestParam Long clientId
) {
    paymentService.markDemoSuccess(paymentId, clientId);
    return ResponseEntity.ok("OK");
}
}