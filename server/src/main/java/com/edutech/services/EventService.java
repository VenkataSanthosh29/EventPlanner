package com.edutech.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.entities.Event;
import com.edutech.entities.EventPlanner;
import com.edutech.entities.Task;
import com.edutech.repositories.EventPlannerRepository;
import com.edutech.repositories.EventRepository;
import com.edutech.repositories.TaskRepository;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventPlannerRepository eventPlannerRepository;

    @Autowired
    private TaskRepository taskRepository;

    // ✅ CREATE EVENT — FORCE INITIATED
    public Event createEvent(Long plannerId, Event event) {

        EventPlanner planner = eventPlannerRepository.findById(plannerId)
                .orElseThrow(() -> new RuntimeException("Planner not Found"));

        event.setPlanner(planner);
        event.setStatus("INITIATED"); // ✅ initial status
        event.setEventType(event.getEventType());  // already coming from request
        return eventRepository.save(event);
    }

    // ✅ GET ALL EVENTS
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    // ✅ UPDATE EVENT — metadata always allowed, status validated only when changed
    public Event updateEvent(Long eventId, Event eventDetails) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not Found"));

        String oldStatus = event.getStatus();
        String newStatus = eventDetails.getStatus();

        // ✅ Always allow metadata updates (real-world requirement)
        event.setTitle(eventDetails.getTitle());
        event.setDate(eventDetails.getDate());
        event.setLocation(eventDetails.getLocation());
        event.setDescription(eventDetails.getDescription());
        event.setEventType(eventDetails.getEventType());
        // ✅ Update status ONLY if it is provided and actually different
        if (newStatus != null && !newStatus.isBlank() && !newStatus.equals(oldStatus)) {

            // ✅ Validate forward-only transitions
            if (!isValidEventStatusTransition(oldStatus, newStatus)) {
                throw new IllegalStateException(
                        "Invalid event status transition: " + oldStatus + " -> " + newStatus
                );
            }

            event.setStatus(newStatus);
        }

        Event saved = eventRepository.save(event);

        // ✅ If event became COMPLETED, complete all remaining tasks for that event
        if (!"COMPLETED".equals(oldStatus) && "COMPLETED".equals(saved.getStatus())) {
            List<Task> pendingTasks = taskRepository.findByEventIdAndStatusNot(saved.getId(), "COMPLETED");
            for (Task t : pendingTasks) {
                t.setStatus("COMPLETED");
            }
            taskRepository.saveAll(pendingTasks);
        }

        return saved;
    }

    // ✅ GET EVENTS BY PLANNER
    public List<Event> getEventsByPlanner(Long plannerId) {
        return eventRepository.findByPlannerId(plannerId);
    }

    // ✅ CLIENT FEEDBACK (NO STATUS CHANGE)
    public Event updateFeedback(Long eventId, String feedback) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not Found"));

        event.setFeedback(feedback);
        return eventRepository.save(event);
    }

    // ✅ STATUS TRANSITION RULES (forward-only)
    private boolean isValidEventStatusTransition(String current, String next) {
        if (current == null || next == null) return false;

        switch (current) {
            case "INITIATED":
                return "IN_PROGRESS".equals(next);
            case "IN_PROGRESS":
                return "COMPLETED".equals(next);
            case "COMPLETED":
                return false;
            default:
                return false;
        }
    }
}