package com.edutech.controllers;

import com.edutech.dto.EventRequestCreateDto;
import com.edutech.dto.PlannerProfileDto;
import com.edutech.entities.Event;
import com.edutech.entities.EventPlanner;
import com.edutech.entities.EventRequest;
import com.edutech.repositories.EventPlannerRepository;
import com.edutech.repositories.EventRepository;
import com.edutech.services.EventRequestService;
import com.edutech.services.EventService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client")
public class ClientController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventPlannerRepository plannerRepository;

    @Autowired
    private EventRequestService requestService;

    @Autowired
    private EventService eventService;

    // -------------------- EVENTS (Client sees ALL events: Option B) --------------------

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventRepository.findAll());
    }

    // -------------------- PLANNER PROFILE --------------------

    @GetMapping("/planners/{plannerId}")
    public ResponseEntity<PlannerProfileDto> getPlannerProfile(@PathVariable Long plannerId) {

        EventPlanner planner = plannerRepository.findById(plannerId)
                .orElseThrow(() -> new RuntimeException("Planner not found"));

        Double avg = eventRepository.findAverageRatingByPlanner(plannerId);
        double avgRating = avg == null ? 0.0 : avg;

        return ResponseEntity.ok(new PlannerProfileDto(planner.getId(), planner.getUsername(), avgRating));
    }

    @GetMapping("/planners/{plannerId}/events")
    public ResponseEntity<List<Event>> getEventsByPlanner(@PathVariable Long plannerId) {
        return ResponseEntity.ok(eventRepository.findByPlannerId(plannerId));
    }

    // -------------------- REQUESTS --------------------

    @PostMapping("/planners/{plannerId}/requests")
    public ResponseEntity<EventRequest> createRequest(
            @PathVariable Long plannerId,
            @RequestBody EventRequestCreateDto dto) {

        return ResponseEntity.ok(requestService.createRequest(plannerId, dto));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<EventRequest>> getClientRequests(@RequestParam Long clientId) {
        return ResponseEntity.ok(requestService.getRequestsForClient(clientId));
    }

    // ✅ Client accepts budget -> AGREED -> Event + Payment created
    @PostMapping("/requests/{requestId}/accept-budget")
    public ResponseEntity<EventRequest> acceptBudget(
            @PathVariable Long requestId,
            @RequestParam Long clientId
    ) {
        return ResponseEntity.ok(requestService.acceptBudget(requestId, clientId));
    }

    // ✅ Client rejects budget -> REJECTED
    @PostMapping("/requests/{requestId}/reject-budget")
    public ResponseEntity<EventRequest> rejectBudget(
            @PathVariable Long requestId,
            @RequestParam Long clientId
    ) {
        return ResponseEntity.ok(requestService.rejectBudget(requestId, clientId));
    }

    // -------------------- FEEDBACK + RATING --------------------

    @PutMapping("/event/{eventId}")
    public ResponseEntity<Event> updateFeedbackAndRating(
            @PathVariable Long eventId,
            @RequestParam(required = false) String feedback,
            @RequestParam(required = false) Integer rating
    ) {
        Event updated = eventService.updateFeedbackAndRating(eventId, feedback, rating);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/events/rating/average")
    public ResponseEntity<Double> getAverageRating() {
        Double avg = eventRepository.findAverageRating();
        return ResponseEntity.ok(avg != null ? avg : 0.0);
    }
}