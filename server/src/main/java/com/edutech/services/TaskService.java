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
    public Task updateTaskStatus(Long taskId,String status){
          if(!taskRepository.existsById(taskId)){
            throw new RuntimeException("Task not Found");
        }
        Task oldTask=taskRepository.findById(taskId).orElse(null);
        oldTask.setStatus(status);
        return taskRepository.save(oldTask);
    }

    // write the code here
}

