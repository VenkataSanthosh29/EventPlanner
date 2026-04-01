package com.edutech.controllers;

import com.edutech.entities.Event;
import com.edutech.services.EventService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client")
public class ClientController {

    @Autowired
    private EventService eventService;

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getEvents() {

        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @PutMapping("/event/{eventId}")
    public ResponseEntity<Event> updateFeedback(
            @PathVariable Long eventId,
            @RequestParam String feedback) {

        Event updatedEvent =
                eventService.updateFeedback(eventId, feedback);
        return ResponseEntity.ok(updatedEvent);
    }
}