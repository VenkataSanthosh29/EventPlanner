package com.edutech.services;

import com.edutech.dto.EventRequestCreateDto;
import com.edutech.entities.Event;
import com.edutech.entities.EventPlanner;
import com.edutech.entities.EventRequest;
import com.edutech.repositories.EventPlannerRepository;
import com.edutech.repositories.EventRepository;
import com.edutech.repositories.EventRequestRepository;

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

    public EventRequest createRequest(Long plannerId, EventRequestCreateDto dto) {

        EventPlanner planner = plannerRepository.findById(plannerId)
                .orElseThrow(() -> new RuntimeException("Planner not found"));

        EventRequest req = new EventRequest();
        req.setPlannerId(planner.getId());
        req.setPlannerName(planner.getUsername()); // adjust if your field differs

        req.setClientId(dto.getClientId());
        req.setClientName(dto.getClientName());

        req.setEventType(dto.getEventType());
        req.setPreferredDate(dto.getPreferredDate());
        req.setLocation(dto.getLocation());
        req.setDescription(dto.getDescription());

        req.setStatus("PENDING");
        return requestRepository.save(req);
    }

    public List<EventRequest> getRequestsForPlanner(Long plannerId) {
        return requestRepository.findByPlannerIdOrderByCreatedAtDesc(plannerId);
    }

    public List<EventRequest> getRequestsForClient(Long clientId) {
        return requestRepository.findByClientIdOrderByCreatedAtDesc(clientId);
    }

    public EventRequest acceptRequest(Long requestId) {

        EventRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!"PENDING".equals(req.getStatus())) {
            throw new IllegalStateException("Request already processed");
        }

        EventPlanner planner = plannerRepository.findById(req.getPlannerId())
                .orElseThrow(() -> new RuntimeException("Planner not found"));

        Event event = new Event();
        event.setPlanner(planner);

        // ✅ Copy Event Type from request
        event.setEventType(req.getEventType());

        // ✅ Create a meaningful title
        event.setTitle("Requested " + req.getEventType() + " Event - " + req.getClientName());

        event.setLocation(req.getLocation() != null ? req.getLocation() : "");
        event.setDescription(req.getDescription() != null ? req.getDescription() : "");

        // ✅ LocalDateTime parsing from "yyyy-MM-ddTHH:mm"
        event.setDate(parseDate(req.getPreferredDate()));

        // status workflow
        event.setStatus("INITIATED");

        Event created = eventRepository.save(event);

        req.setStatus("ACCEPTED");
        req.setCreatedEventId(created.getId());

        return requestRepository.save(req);
    }

    public EventRequest rejectRequest(Long requestId) {

        EventRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!"PENDING".equals(req.getStatus())) {
            throw new IllegalStateException("Request already processed");
        }

        req.setStatus("REJECTED");
        return requestRepository.save(req);
    }

    private LocalDateTime parseDate(String input) {
        if (input == null || input.isBlank()) return null;
        try {
            // Angular datetime-local => "2026-04-16T15:00"
            return LocalDateTime.parse(input);
        } catch (DateTimeParseException ex) {
            // If parsing fails, keep null so planner can edit later
            return null;
        }
    }
}