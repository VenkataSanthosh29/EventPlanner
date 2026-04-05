package com.edutech.repositories;

import com.edutech.entities.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.Collection;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByEventId(Long eventId);
    List<Payment> findByClientId(Long clientId);
    Optional<Payment> findByRazorpayQrId(String qrId);
List<Payment> findByEventIdIn(Collection<Long> eventIds);
}