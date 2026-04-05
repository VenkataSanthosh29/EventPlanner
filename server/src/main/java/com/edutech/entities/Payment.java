package com.edutech.entities;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long eventId;
    private Long clientId;

    // rupees
    private Double amount;

    // CREATED / QR_CREATED / SUCCESS / FAILED
    private String status = "CREATED";

    private String provider = "RAZORPAY";
    private String razorpayQrId;
    private String razorpayQrImageUrl;
    private String razorpayPaymentId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime paidAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "CREATED";
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getRazorpayQrId() { return razorpayQrId; }
    public void setRazorpayQrId(String razorpayQrId) { this.razorpayQrId = razorpayQrId; }

    public String getRazorpayQrImageUrl() { return razorpayQrImageUrl; }
    public void setRazorpayQrImageUrl(String razorpayQrImageUrl) { this.razorpayQrImageUrl = razorpayQrImageUrl; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
}