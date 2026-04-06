package com.edutech.services;

import com.edutech.entities.Event;
import com.edutech.entities.Staff;
import com.edutech.entities.Task;
import com.edutech.repositories.EventRepository;
import com.edutech.repositories.StaffRepository;
import com.edutech.repositories.TaskRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private EventRepository eventRepository;

    //  Planner: Create task under a specific event
    public Task createTaskForEvent(Long eventId, Task task) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not Found"));

        task.setEvent(event);

        // Planner rule: status always INITIATED
        task.setStatus("INITIATED");

        return taskRepository.save(task);
    }

    // Planner: Get all tasks
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // Planner: Assign task to staff
    public Task assignTask(Long taskId, Long staffId) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not Found"));

        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not Found"));

        task.setAssignedStaff(staff);
        return taskRepository.save(task);
    }

    // Staff: View assigned tasks
    public List<Task> getAssignedTasks(Long staffId) {
        return taskRepository.findByAssignedStaffId(staffId);
    }

    //  Staff: Update task status forward-only
    public Task updateTaskStatus(Long taskId, String status) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not Found"));

        String current = task.getStatus();

        if ("COMPLETED".equals(current)) {
            throw new IllegalStateException("Completed task cannot be modified");
        }

        if ("INITIATED".equals(status)) {
            throw new IllegalStateException("Staff cannot set INITIATED");
        }

        if ("INITIATED".equals(current) && !"IN_PROGRESS".equals(status)) {
            throw new IllegalStateException("Task must move to IN_PROGRESS first");
        }

        if ("IN_PROGRESS".equals(current) && !"COMPLETED".equals(status)) {
            throw new IllegalStateException("Task can only move to COMPLETED");
        }

        task.setStatus(status);
        return taskRepository.save(task);
    }

    // Used when Event becomes COMPLETED
    public void completePendingTasksForEvent(Long eventId) {
        List<Task> pending = taskRepository.findByEventIdAndStatusNot(eventId, "COMPLETED");
        for (Task t : pending) {
            t.setStatus("COMPLETED");
        }
        taskRepository.saveAll(pending);
    }

    // Tasks by Event (for UI filtering)
    public List<Task> getTasksByEvent(Long eventId) {
        return taskRepository.findByEventId(eventId);
    }
}