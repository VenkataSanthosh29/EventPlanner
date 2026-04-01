package com.edutech.services;



import com.edutech.entities.Staff;
import com.edutech.entities.Task;
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
    public Task createTask(Task task){
        task.setStatus("INITIATED");
        return taskRepository.save(task);
    }
    public List<Task> getAllTasks(){
        return taskRepository.findAll();
    }
    public Task assignTask(Long taskId,Long staffId){
        if(!taskRepository.existsById(taskId)){
            throw new RuntimeException("Task not Found");
        }
        else if(!staffRepository.existsById(staffId)){
            throw new RuntimeException("Staff not Found");
        }
        Task oldTask=taskRepository.findById(taskId).orElse(null);
        oldTask.setAssignedStaff(staffRepository.findById(staffId).orElse(null));
        return taskRepository.save(oldTask);
    }
    public List<Task> getAssignedTasks(Long staffId){
        return taskRepository.findByAssignedStaffId(staffId);
    }
    // public Task updateTaskStatus(Long taskId,String status){
    //       if(!taskRepository.existsById(taskId)){
    //         throw new RuntimeException("Task not Found");
    //     }
    //     Task oldTask=taskRepository.findById(taskId).orElse(null);
    //     oldTask.setStatus(status);
    //     return taskRepository.save(oldTask);
    // }

    public Task updateTaskStatus(Long taskId, String newStatus) {

    Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));

    String currentStatus = task.getStatus();

    // ✅ Cannot modify completed task
    if ("COMPLETED".equals(currentStatus)) {
        throw new IllegalStateException("Completed task cannot be modified");
    }

    // ✅ Validate allowed transitions
    if ("INITIATED".equals(currentStatus)) {
        if (!"IN_PROGRESS".equals(newStatus)) {
            throw new IllegalStateException("Task must move to IN_PROGRESS first");
        }
    } 
    else if ("IN_PROGRESS".equals(currentStatus)) {
        if (!"COMPLETED".equals(newStatus)) {
            throw new IllegalStateException("Task can only move to COMPLETED");
        }
    }

    task.setStatus(newStatus);
    return taskRepository.save(task);
}
    // write the code here
}

