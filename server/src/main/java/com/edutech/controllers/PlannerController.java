package com.edutech.controllers;

import com.edutech.entities.Event;
import com.edutech.entities.Task;
import com.edutech.services.EventService;
import com.edutech.services.TaskService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planner")
public class PlannerController {

    @Autowired
    private EventService eventService;

    @Autowired
    private TaskService taskService;

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

        return ResponseEntity.ok(
                eventService.getEventsByPlanner(plannerId));
    }

    @PostMapping("/task")
    public ResponseEntity<Task> createTask(@RequestBody Task task) {

        Task createdTask = taskService.createTask(task);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

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
}
