// package com.edutech.controllers;


// import com.edutech.entities.Event;
// import com.edutech.entities.Task;
// import com.edutech.services.EventService;
// import com.edutech.services.TaskService;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;


// public class PlannerController {

//     // write the code here

// }



package com.edutech.controllers;

import com.edutech.entities.Event;
import com.edutech.entities.Task;
import com.edutech.services.EventService;
import com.edutech.services.TaskService;

import org.springframework.beans.factory.annotation.Autowired;
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
    public Event createEvent(@RequestParam Long plannerId,
                             @RequestBody Event event) {
        return eventService.createEvent(plannerId, event);
    }

    @PutMapping("/event/{id}")
    public Event updateEvent(@PathVariable Long id,
                             @RequestBody Event event) {
        return eventService.updateEvent(id, event);
    }

    @GetMapping("/events")
    public List<Event> getPlannerEvents(@RequestParam Long plannerId) {
        return eventService.getEventsByPlanner(plannerId);
    }

    @PostMapping("/task")
    public Task createTask(@RequestBody Task task) {
        return taskService.createTask(task);
    }

    @GetMapping("/tasks")
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    @PostMapping("/tasks/{taskId}/assign/{staffId}")
    public Task assignTask(@PathVariable Long taskId,
                           @PathVariable Long staffId) {
        return taskService.assignTask(taskId, staffId);
    }
}
