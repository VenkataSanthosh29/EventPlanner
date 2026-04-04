
package com.edutech.controllers;

import com.edutech.entities.Event;
import com.edutech.entities.Task;
import com.edutech.services.EventService;
import com.edutech.services.TaskService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.entities.EventRequest;
import com.edutech.services.EventRequestService;
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
    public ResponseEntity<List<Event>> getEventsByPlanner(
            @RequestParam Long plannerId) {

        return ResponseEntity.ok(eventService.getEventsByPlanner(plannerId));
    }

    // ✅ All tasks (global list)
    @GetMapping("/tasks")
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    // ✅ Assign task to staff
    @PostMapping("/tasks/{taskId}/assign/{staffId}")
    public ResponseEntity<Task> assignTaskToStaff(
            @PathVariable Long taskId,
            @PathVariable Long staffId) {

        Task task = taskService.assignTask(taskId, staffId);
        return ResponseEntity.ok(task);
    }

    // ✅ Create task for a specific event
    @PostMapping("/events/{eventId}/task")
    public ResponseEntity<Task> createTaskForEvent(
            @PathVariable Long eventId,
            @RequestBody Task task) {

        Task created = taskService.createTaskForEvent(eventId, task);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // ✅ OPTIONAL (recommended): get tasks for a particular event
    @GetMapping("/events/{eventId}/tasks")
    public ResponseEntity<List<Task>> getTasksByEvent(
            @PathVariable Long eventId) {

        return ResponseEntity.ok(taskService.getTasksByEvent(eventId));
    }


  @GetMapping("/requests")
public ResponseEntity<List<EventRequest>> getRequests(@RequestParam Long plannerId) {
    return ResponseEntity.ok(requestService.getRequestsForPlanner(plannerId));
}

@PostMapping("/requests/{requestId}/accept")
public ResponseEntity<EventRequest> accept(@PathVariable Long requestId) {
    return ResponseEntity.ok(requestService.acceptRequest(requestId));
}

@PostMapping("/requests/{requestId}/reject")
public ResponseEntity<EventRequest> reject(@PathVariable Long requestId) {
    return ResponseEntity.ok(requestService.rejectRequest(requestId));
}
}