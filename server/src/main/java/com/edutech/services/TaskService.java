// package com.edutech.services;



// import com.edutech.entities.Staff;
// import com.edutech.entities.Task;
// import com.edutech.repositories.StaffRepository;
// import com.edutech.repositories.TaskRepository;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import java.util.List;


// public class TaskService {

//     // write the code here
// }




//set2
// package com.edutech.services;

// import com.edutech.entities.Staff;
// import com.edutech.entities.Task;
// import com.edutech.repositories.StaffRepository;
// import com.edutech.repositories.TaskRepository;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import java.util.List;

// @Service
// public class TaskService {

//     @Autowired
//     private TaskRepository taskRepository;

//     @Autowired
//     private StaffRepository staffRepository;

//     public Task createTask(Task task) {
//         return taskRepository.save(task);
//     }

//     public List<Task> getAllTasks() {
//         return taskRepository.findAll();
//     }

//     public Task assignTask(Long taskId, Long staffId) {
//         Task task = taskRepository.findById(taskId).orElse(null);
//         Staff staff = staffRepository.findById(staffId).orElse(null);
//         task.setAssignedStaff(staff);
//         return taskRepository.save(task);
//     }

//     public List<Task> getAssignedTasks(Long staffId) {
//         return taskRepository.findByAssignedStaffId(staffId);
//     }

//     public Task updateTaskStatus(Long taskId, String status) {
//         Task task = taskRepository.findById(taskId).orElse(null);
//         task.setStatus(status);
//         return taskRepository.save(task);
//     }
// }




// //set3
// package com.edutech.services;

// import com.edutech.entities.Staff;
// import com.edutech.entities.Task;
// import com.edutech.repositories.StaffRepository;
// import com.edutech.repositories.TaskRepository;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import java.util.List;

// @Service
// public class TaskService {

//     @Autowired
//     private TaskRepository taskRepository;

//     @Autowired
//     private StaffRepository staffRepository;

//     public Task createTask(Task task) {
//         // ✅ REQUIRED DEFAULT STATUS
//         if (task.getStatus() == null) {
//             task.setStatus("PENDING");
//         }
//         return taskRepository.save(task);
//     }

//     public List<Task> getAllTasks() {
//         return taskRepository.findAll();
//     }

//     public Task assignTask(Long taskId, Long staffId) {
//         Task task = taskRepository.findById(taskId)
//                 .orElseThrow(() -> new RuntimeException("Task not found"));

//         Staff staff = staffRepository.findById(staffId)
//                 .orElseThrow(() -> new RuntimeException("Staff not found"));

//         task.setAssignedStaff(staff);
//         return taskRepository.save(task);
//     }

//     public List<Task> getAssignedTasks(Long staffId) {
//         return taskRepository.findByAssignedStaffId(staffId);
//     }

//     public Task updateTaskStatus(Long taskId, String status) {
//         Task task = taskRepository.findById(taskId)
//                 .orElseThrow(() -> new RuntimeException("Task not found"));

//         task.setStatus(status);
//         return taskRepository.save(task);
//     }
// }






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

    // ✅ DO NOT force status
    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task assignTask(Long taskId, Long staffId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        Staff staff = staffRepository.findById(staffId).orElse(null);
        task.setAssignedStaff(staff);
        return taskRepository.save(task);
    }

    public List<Task> getAssignedTasks(Long staffId) {
        return taskRepository.findByAssignedStaffId(staffId);
    }

    public Task updateTaskStatus(Long taskId, String status) {
        Task task = taskRepository.findById(taskId).orElse(null);
        task.setStatus(status);
        return taskRepository.save(task);
    }
}