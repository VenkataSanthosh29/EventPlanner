// package com.edutech.controllers;

// import com.edutech.entities.Event;
// import com.edutech.services.EventService;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import com.edutech.repositories.EventRepository;

// import java.util.List;

// @RestController
// @RequestMapping("/api/client")
// public class ClientController {

//     @Autowired
//     private EventService eventService;

//     @Autowired
//     private EventRepository eventRepository;

//     @GetMapping("/events")
//     public ResponseEntity<List<Event>> getEvents() {

//         return ResponseEntity.ok(eventService.getAllEvents());
//     }

//     // @PutMapping("/event/{eventId}")
//     // public ResponseEntity<Event> updateFeedback(
//     //         @PathVariable Long eventId,
//     //         @RequestParam String feedback) {

//     //     Event updatedEvent =
//     //             eventService.updateFeedback(eventId, feedback);
//     //     return ResponseEntity.ok(updatedEvent);
//     // }

//     @PutMapping("/event/{eventId}")
//     public ResponseEntity<Event> updateFeedbackAndRating(
//         @PathVariable Long eventId,
//         @RequestParam(required = false) String feedback,
//         @RequestParam(required = false) Integer rating
// ) {
//     Event updated = eventService.updateFeedbackAndRating(eventId, feedback, rating);
//     return ResponseEntity.ok(updated);
// }

// @GetMapping("/events/rating/average")
// public ResponseEntity<Double> getAverageRating() {
//     Double avg = eventRepository.findAverageRating();
//     return ResponseEntity.ok(avg != null ? avg : 0.0);
// }
// }

package com.edutech.controllers;

import com.edutech.dto.EventRequestCreateDto;
import com.edutech.dto.PlannerProfileDto;
import com.edutech.entities.Event;
import com.edutech.entities.EventPlanner;
import com.edutech.entities.EventRequest;
import com.edutech.repositories.EventPlannerRepository;
import com.edutech.repositories.EventRepository;
import com.edutech.services.EventRequestService;

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

    // ✅ Client sees ALL events (Option B)
    @GetMapping("/events")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventRepository.findAll());
    }

    // ✅ Planner profile (avg rating)
    @GetMapping("/planners/{plannerId}")
    public ResponseEntity<PlannerProfileDto> getPlannerProfile(@PathVariable Long plannerId) {

        EventPlanner planner = plannerRepository.findById(plannerId)
                .orElseThrow(() -> new RuntimeException("Planner not found"));

        Double avg = eventRepository.findAverageRatingByPlanner(plannerId);
        double avgRating = avg == null ? 0.0 : avg;

        return ResponseEntity.ok(new PlannerProfileDto(planner.getId(), planner.getUsername(), avgRating));
    }

    // ✅ Events by planner
    @GetMapping("/planners/{plannerId}/events")
    public ResponseEntity<List<Event>> getEventsByPlanner(@PathVariable Long plannerId) {
        return ResponseEntity.ok(eventRepository.findByPlannerId(plannerId));
    }

    // ✅ Request event from planner
    @PostMapping("/planners/{plannerId}/requests")
    public ResponseEntity<EventRequest> createRequest(
            @PathVariable Long plannerId,
            @RequestBody EventRequestCreateDto dto) {

        return ResponseEntity.ok(requestService.createRequest(plannerId, dto));
    }

    // ✅ Client's requests list
    @GetMapping("/requests")
    public ResponseEntity<List<EventRequest>> getClientRequests(@RequestParam Long clientId) {
        return ResponseEntity.ok(requestService.getRequestsForClient(clientId));
    }
}
