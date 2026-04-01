package com.edutech.controllers;

import com.edutech.entities.Task;
import com.edutech.entities.Staff;
import com.edutech.repositories.StaffRepository;
import com.edutech.services.TaskService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private StaffRepository staffRepository;

    @GetMapping("/tasks/{staffId}")
    public ResponseEntity<List<Task>> getTasks(
            @PathVariable Long staffId) {

        return ResponseEntity.ok(
                taskService.getAssignedTasks(staffId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Staff>> getStaff() {

        return ResponseEntity.ok(staffRepository.findAll());
    }

    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<Task> updateTaskStatus(
            @PathVariable Long taskId,
            @RequestParam String status) {

        Task updatedTask =
                taskService.updateTaskStatus(taskId, status);
        return ResponseEntity.ok(updatedTask);
    }
}
