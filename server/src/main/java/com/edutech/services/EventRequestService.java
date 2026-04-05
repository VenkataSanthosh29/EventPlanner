package com.edutech.services;

import com.edutech.dto.EventRequestCreateDto;
import com.edutech.entities.Event;
import com.edutech.entities.EventPlanner;
import com.edutech.entities.EventRequest;
import com.edutech.entities.Payment;
import com.edutech.repositories.EventPlannerRepository;
import com.edutech.repositories.EventRepository;
import com.edutech.repositories.EventRequestRepository;
import com.edutech.repositories.PaymentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class EventRequestService {

    @Autowired
    private EventRequestRepository requestRepository;

    @Autowired
    private EventPlannerRepository plannerRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    // ✅ Client creates request
    public EventRequest createRequest(Long plannerId, EventRequestCreateDto dto) {

        EventPlanner planner = plannerRepository.findById(plannerId)
                .orElseThrow(() -> new RuntimeException("Planner not found"));

        EventRequest req = new EventRequest();
        req.setPlannerId(planner.getId());
        req.setPlannerName(planner.getUsername());

        req.setClientId(dto.getClientId());
        req.setClientName(dto.getClientName());

        req.setEventType(dto.getEventType());
        req.setPreferredDate(dto.getPreferredDate());
        req.setLocation(dto.getLocation());
        req.setDescription(dto.getDescription());

        // New flow defaults
        req.setStatus("PENDING");
        req.setBudgetStatus("PENDING");

        return requestRepository.save(req);
    }

    public List<EventRequest> getRequestsForPlanner(Long plannerId) {
        return requestRepository.findByPlannerIdOrderByCreatedAtDesc(plannerId);
    }

    public List<EventRequest> getRequestsForClient(Long clientId) {
        return requestRepository.findByClientIdOrderByCreatedAtDesc(clientId);
    }

    // ✅ Planner proposes budget
    public EventRequest proposeBudget(Long requestId, Double budget) {

        EventRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Only allow budget proposal on pending/proposed
        if (!"PENDING".equals(req.getStatus()) && !"BUDGET_PROPOSED".equals(req.getStatus())) {
            throw new IllegalStateException("Cannot propose budget for processed request");
        }

        if (budget == null || budget <= 0) {
            throw new IllegalArgumentException("Budget must be greater than 0");
        }

        req.setBudgetProposed(budget);
        req.setStatus("BUDGET_PROPOSED");
        req.setBudgetStatus("BUDGET_PROPOSED");

        return requestRepository.save(req);
    }

    // ✅ Client accepts budget -> AGREED -> create Event + Payment
    public EventRequest acceptBudget(Long requestId, Long clientId) {

        EventRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!req.getClientId().equals(clientId)) {
            throw new IllegalStateException("Not your request");
        }

        if (!"BUDGET_PROPOSED".equals(req.getStatus())) {
            throw new IllegalStateException("Budget not proposed yet");
        }

        req.setBudgetStatus("CLIENT_ACCEPTED");
        req.setFinalBudget(req.getBudgetProposed());
        req.setStatus("AGREED");

        // ✅ Create Event ONLY after agreement
        EventPlanner planner = plannerRepository.findById(req.getPlannerId())
                .orElseThrow(() -> new RuntimeException("Planner not found"));

        Event event = new Event();
        event.setPlanner(planner);
        event.setEventType(req.getEventType());
        event.setTitle("Agreed " + req.getEventType() + " Event - " + req.getClientName());
        event.setLocation(req.getLocation() != null ? req.getLocation() : "");
        event.setDescription(req.getDescription() != null ? req.getDescription() : "");
        event.setDate(parseDate(req.getPreferredDate()));
        event.setStatus("INITIATED");

        Event createdEvent = eventRepository.save(event);
        req.setCreatedEventId(createdEvent.getId());

        // ✅ Create Payment row (QR will be generated only after event COMPLETED)
        Payment payment = new Payment();
        payment.setEventId(createdEvent.getId());
        payment.setClientId(req.getClientId());
        payment.setAmount(req.getFinalBudget()); // rupees (1A)
        payment.setStatus("CREATED");

        Payment createdPayment = paymentRepository.save(payment);
        req.setPaymentId(createdPayment.getId());

        return requestRepository.save(req);
    }

    // ✅ Client rejects budget -> REJECTED
    public EventRequest rejectBudget(Long requestId, Long clientId) {

        EventRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!req.getClientId().equals(clientId)) {
            throw new IllegalStateException("Not your request");
        }

        if (!"BUDGET_PROPOSED".equals(req.getStatus())) {
            throw new IllegalStateException("Budget not proposed yet");
        }

        req.setBudgetStatus("CLIENT_REJECTED");
        req.setStatus("REJECTED");

        return requestRepository.save(req);
    }

    private LocalDateTime parseDate(String input) {
        if (input == null || input.isBlank()) return null;
        try {
            return LocalDateTime.parse(input); // "yyyy-MM-ddTHH:mm"
        } catch (DateTimeParseException ex) {
            return null;
        }
    }
}