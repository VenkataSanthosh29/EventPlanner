package com.edutech.services;

import com.edutech.entities.Event;
import com.edutech.entities.Payment;
import com.edutech.repositories.EventRepository;
import com.edutech.repositories.PaymentRepository;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.time.LocalDateTime;

import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final EventRepository eventRepository;
    private final RazorpayQrService razorpayQrService;

    public PaymentService(PaymentRepository paymentRepository,
                          EventRepository eventRepository,
                          RazorpayQrService razorpayQrService) {
        this.paymentRepository = paymentRepository;
        this.eventRepository = eventRepository;
        this.razorpayQrService = razorpayQrService;
    }

    public Payment createQrForPayment(Long paymentId, Long clientId) throws RazorpayException {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (!payment.getClientId().equals(clientId)) {
            throw new IllegalStateException("Not your payment");
        }

        Event event = eventRepository.findById(payment.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!"COMPLETED".equals(event.getStatus())) {
            throw new IllegalStateException("Payment enabled only after event COMPLETED");
        }

        if ("SUCCESS".equals(payment.getStatus())) return payment;

        // avoid duplicate QR creation
        if (payment.getRazorpayQrId() != null && !"FAILED".equals(payment.getStatus())) {
            return payment;
        }

        long paise = Math.round(payment.getAmount() * 100);

        JSONObject qr = razorpayQrService.createUpiQr(paise, payment.getId(), payment.getEventId());

        payment.setRazorpayQrId(qr.getString("id"));
        payment.setRazorpayQrImageUrl(qr.getString("image_url"));
        payment.setStatus("QR_CREATED");

        return paymentRepository.save(payment);
    }

    public Payment getPayment(Long paymentId, Long clientId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (!payment.getClientId().equals(clientId)) {
            throw new IllegalStateException("Not your payment");
        }
        return payment;
    }

    public List<Payment> getPaymentsForClient(Long clientId) {
        return paymentRepository.findByClientId(clientId);
    }

    public void markSuccessByQr(String qrId, String razorpayPaymentId) {
        Payment payment = paymentRepository.findByRazorpayQrId(qrId)
                .orElseThrow(() -> new RuntimeException("Payment not found for QR"));

        payment.setStatus("SUCCESS");
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);
    }

    public void markFailedByQr(String qrId, String razorpayPaymentId) {
        Payment payment = paymentRepository.findByRazorpayQrId(qrId)
                .orElseThrow(() -> new RuntimeException("Payment not found for QR"));

        payment.setStatus("FAILED");
        payment.setRazorpayPaymentId(razorpayPaymentId);
        paymentRepository.save(payment);
    }
public void markDemoSuccess(Long paymentId, Long clientId) {
    Payment p = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new RuntimeException("Payment not found"));

    if (!p.getClientId().equals(clientId)) {
        throw new IllegalStateException("Not your payment");
    }

    if ("SUCCESS".equals(p.getStatus())) return;

    p.setStatus("SUCCESS");
    p.setPaidAt(LocalDateTime.now());

    paymentRepository.save(p);
}

public List<Payment> getPaymentsForPlanner(Long plannerId) {
    // find all planner events
    List<Event> plannerEvents = eventRepository.findByPlannerId(plannerId);

    List<Long> eventIds = plannerEvents.stream()
            .filter(e -> e.getId() != null)
            .map(Event::getId)
            .collect(Collectors.toList());

    if (eventIds.isEmpty()) return java.util.Collections.emptyList();

    return paymentRepository.findByEventIdIn(eventIds);
}
}