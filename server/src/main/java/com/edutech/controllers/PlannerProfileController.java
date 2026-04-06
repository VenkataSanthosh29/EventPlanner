package com.edutech.controllers;

import com.edutech.dto.PlannerProfileDto;
import com.edutech.entities.Event;
import com.edutech.entities.EventRequest;
import com.edutech.entities.Payment;
import com.edutech.entities.User;
import com.edutech.repositories.EventRepository;
import com.edutech.repositories.EventRequestRepository;
import com.edutech.repositories.PaymentRepository;
import com.edutech.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/planner")
public class PlannerProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRequestRepository eventRequestRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    //  Updated profile with split counts + revenue
    @GetMapping("/profile")
    public ResponseEntity<PlannerProfileDto> getPlannerProfile(@RequestParam Long plannerId) {

        User user = userRepository.findById(plannerId)
                .orElseThrow(() -> new RuntimeException("Planner not found"));

        if (!"PLANNER".equals(user.getRole())) {
            throw new RuntimeException("User is not a planner");
        }

        // 1) Total events planned
        List<Event> plannerEvents = eventRepository.findByPlannerId(plannerId);
        long totalEvents = plannerEvents.size();

        // 2) Client events = requests that are AGREED and have createdEventId
        List<EventRequest> reqs = eventRequestRepository.findByPlannerIdOrderByCreatedAtDesc(plannerId);

        Set<Long> clientEventIds = reqs.stream()
                .filter(r -> "AGREED".equals(r.getStatus()) && r.getCreatedEventId() != null)
                .map(EventRequest::getCreatedEventId)
                .collect(Collectors.toSet());

        long clientEventsCount = clientEventIds.size();

        // 3) Self-created events = total - client events
        long selfCreated = totalEvents - clientEventsCount;
        if (selfCreated < 0) selfCreated = 0;

        // 4) Revenue = sum of SUCCESS payments for client events
        double revenue = 0.0;
        long paidClientEvents = 0;

        if (!clientEventIds.isEmpty()) {
            List<Payment> payments = paymentRepository.findByEventIdIn(clientEventIds);

            // eventId -> payment
            Map<Long, Payment> byEvent = new HashMap<>();
            for (Payment p : payments) {
                if (p.getEventId() != null) byEvent.put(p.getEventId(), p);
            }

            for (Long eventId : clientEventIds) {
                Payment p = byEvent.get(eventId);
                if (p != null && "SUCCESS".equals(p.getStatus())) {
                    paidClientEvents++;
                    revenue += (p.getAmount() != null ? p.getAmount() : 0.0);
                }
            }
        }

        // 5) Avg rating (existing)
        Double avg = eventRepository.findAverageRatingByPlanner(plannerId);
        double avgRating = (avg == null) ? 0.0 : avg;

        PlannerProfileDto dto = new PlannerProfileDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                totalEvents,
                selfCreated,
                clientEventsCount,
                paidClientEvents,
                revenue,
                avgRating
        );

        return ResponseEntity.ok(dto);
    }

    //  Planner payments so dashboard can show Paid/Not Paid per event
    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> getPlannerPayments(@RequestParam Long plannerId) {

        // All events created by this planner (self + client)
        List<Event> events = eventRepository.findByPlannerId(plannerId);

        List<Long> eventIds = events.stream()
                .map(Event::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (eventIds.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<Payment> payments = paymentRepository.findByEventIdIn(eventIds);
        return ResponseEntity.ok(payments);
    }
}