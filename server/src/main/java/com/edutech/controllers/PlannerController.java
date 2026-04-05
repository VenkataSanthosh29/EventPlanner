package com.edutech.controllers;

import com.edutech.entities.Event;
import com.edutech.entities.Task;
import com.edutech.entities.EventRequest;
import com.edutech.services.EventService;
import com.edutech.services.TaskService;
import com.edutech.services.EventRequestService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.edutech.entities.Payment;
import com.edutech.services.PaymentService;
import java.util.List;

@RestController
@RequestMapping("/api/planner")
public class PlannerController {

    @Autowired
    private EventService eventService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private EventRequestService requestService;

    @Autowired
    private PaymentService paymentService;

    // -------------------- EVENTS --------------------

    @PostMapping("/event")
    public ResponseEntity<Event> createEvent(
            @RequestParam Long plannerId,
            @RequestBody Event event) {

        Event createdEvent = eventService.createEvent(plannerId, event);
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    @PutMapping("/event/{id}")
    public ResponseEntity<Event> updateEvent(
            @PathVariable Long id,
            @RequestBody Event eventDetails) {

        Event updatedEvent = eventService.updateEvent(id, eventDetails);
        return ResponseEntity.ok(updatedEvent);
    }

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getEventsByPlanner(@RequestParam Long plannerId) {
        return ResponseEntity.ok(eventService.getEventsByPlanner(plannerId));
    }

    // -------------------- TASKS --------------------

    @GetMapping("/tasks")
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @PostMapping("/tasks/{taskId}/assign/{staffId}")
    public ResponseEntity<Task> assignTaskToStaff(
            @PathVariable Long taskId,
            @PathVariable Long staffId) {

        Task task = taskService.assignTask(taskId, staffId);
        return ResponseEntity.ok(task);
    }

    @PostMapping("/events/{eventId}/task")
    public ResponseEntity<Task> createTaskForEvent(
            @PathVariable Long eventId,
            @RequestBody Task task) {

        Task created = taskService.createTaskForEvent(eventId, task);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/events/{eventId}/tasks")
    public ResponseEntity<List<Task>> getTasksByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(taskService.getTasksByEvent(eventId));
    }

    // -------------------- REQUESTS + BUDGET --------------------
    // ✅ Planner can view requests
    @GetMapping("/requests")
    public ResponseEntity<List<EventRequest>> getRequests(@RequestParam Long plannerId) {
        return ResponseEntity.ok(requestService.getRequestsForPlanner(plannerId));
    }

    // ✅ Planner proposes budget (NEW FLOW)
    @PostMapping("/requests/{requestId}/propose-budget")
    public ResponseEntity<EventRequest> proposeBudget(
            @PathVariable Long requestId,
            @RequestParam Double budget
    ) {
        return ResponseEntity.ok(requestService.proposeBudget(requestId, budget));
    }

}