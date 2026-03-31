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

    public Event createEvent(Long plannerId, Event event) {

        EventPlanner planner = eventPlannerRepository.findById(plannerId)
                .orElseThrow(() -> new RuntimeException("Planner not Found"));

        event.setPlanner(planner);
        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event updateEvent(Long eventId, Event eventDetails) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not Found"));

        event.setTitle(eventDetails.getTitle());
        event.setDate(eventDetails.getDate());
        event.setLocation(eventDetails.getLocation());
        event.setDescription(eventDetails.getDescription());
        event.setStatus(eventDetails.getStatus());

        return eventRepository.save(event);
    }

    public List<Event> getEventsByPlanner(Long plannerId) {
        return eventRepository.findByPlannerId(plannerId);
    }

    public Event updateFeedback(Long eventId, String feedback) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not Found"));

        event.setFeedback(feedback);
        return eventRepository.save(event);
    }
}