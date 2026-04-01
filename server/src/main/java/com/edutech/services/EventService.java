// package com.edutech.services;

// import java.util.List;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import com.edutech.entities.Event;
// import com.edutech.entities.EventPlanner;
// import com.edutech.repositories.EventPlannerRepository;
// import com.edutech.repositories.EventRepository;

// @Service
// public class EventService {

//     @Autowired
//     private EventRepository eventRepository;

//     @Autowired
//     private EventPlannerRepository eventPlannerRepository;

//     public Event createEvent(Long plannerId, Event event) {

//         EventPlanner planner = eventPlannerRepository.findById(plannerId)
//                 .orElseThrow(() -> new RuntimeException("Planner not Found"));

//         event.setPlanner(planner);
//         return eventRepository.save(event);
//     }

//     public List<Event> getAllEvents() {
//         return eventRepository.findAll();
//     }

//     public Event updateEvent(Long eventId, Event eventDetails) {

//         Event event = eventRepository.findById(eventId)
//                 .orElseThrow(() -> new RuntimeException("Event not Found"));

//         event.setTitle(eventDetails.getTitle());
//         event.setDate(eventDetails.getDate());
//         event.setLocation(eventDetails.getLocation());
//         event.setDescription(eventDetails.getDescription());
//         event.setStatus(eventDetails.getStatus());

//         return eventRepository.save(event);
//     }

//     public List<Event> getEventsByPlanner(Long plannerId) {
//         return eventRepository.findByPlannerId(plannerId);
//     }

//     public Event updateFeedback(Long eventId, String feedback) {

//         Event event = eventRepository.findById(eventId)
//                 .orElseThrow(() -> new RuntimeException("Event not Found"));

//         event.setFeedback(feedback);
//         return eventRepository.save(event);
//     }
// }

package com.edutech.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.entities.Event;
import com.edutech.entities.EventPlanner;
import com.edutech.repositories.EventPlannerRepository;
import com.edutech.repositories.EventRepository;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventPlannerRepository eventPlannerRepository;

    // ✅ CREATE EVENT — FORCE INITIATED
    public Event createEvent(Long plannerId, Event event) {

        EventPlanner planner = eventPlannerRepository.findById(plannerId)
                .orElseThrow(() -> new RuntimeException("Planner not Found"));

        event.setPlanner(planner);
        event.setStatus("INITIATED"); // ✅ FORCE initial status

        return eventRepository.save(event);
    }

    // ✅ GET ALL EVENTS
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    // ✅ UPDATE EVENT — WITH STATUS WORKFLOW RULES
    public Event updateEvent(Long eventId, Event eventDetails) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not Found"));

        String currentStatus = event.getStatus();
        String newStatus = eventDetails.getStatus();

        // ✅ Prevent modification of completed events
        if ("COMPLETED".equals(currentStatus)) {
            throw new IllegalStateException("Completed event cannot be modified");
        }

        // ✅ Validate status transitions
        if (!isValidEventStatusTransition(currentStatus, newStatus)) {
            throw new IllegalStateException(
                    "Invalid event status transition: "
                    + currentStatus + " → " + newStatus
            );
        }

        // ✅ Update fields
        event.setTitle(eventDetails.getTitle());
        event.setDate(eventDetails.getDate());
        event.setLocation(eventDetails.getLocation());
        event.setDescription(eventDetails.getDescription());

        // ✅ Status updated only if valid
        event.setStatus(newStatus);

        return eventRepository.save(event);
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

    // ✅ STATUS TRANSITION RULES
    private boolean isValidEventStatusTransition(
            String current,
            String next
    ) {
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