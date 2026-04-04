package com.edutech.controllers;

import com.edutech.entities.Event;
import com.edutech.services.EventService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.edutech.repositories.EventRepository;

import java.util.List;

@RestController
@RequestMapping("/api/client")
public class ClientController {

    @Autowired
    private EventService eventService;

    @Autowired
    private EventRepository eventRepository;

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getEvents() {

        return ResponseEntity.ok(eventService.getAllEvents());
    }

    // @PutMapping("/event/{eventId}")
    // public ResponseEntity<Event> updateFeedback(
    //         @PathVariable Long eventId,
    //         @RequestParam String feedback) {

    //     Event updatedEvent =
    //             eventService.updateFeedback(eventId, feedback);
    //     return ResponseEntity.ok(updatedEvent);
    // }

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