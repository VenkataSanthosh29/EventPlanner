// package com.edutech.controllers;

// import com.edutech.entities.Staff;
// import com.edutech.entities.Task;
// import com.edutech.services.TaskService;
// import com.edutech.services.UserService;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;


// public class StaffController {

//    // write the code here

// }


package com.edutech.controllers;

import com.edutech.entities.Task;
import com.edutech.services.TaskService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    @Autowired
    private TaskService taskService;

    @GetMapping("/tasks/{staffId}")
    public List<Task> getAssignedTasks(@PathVariable Long staffId) {
        return taskService.getAssignedTasks(staffId);
    }

    @PutMapping("/tasks/{taskId}")
    public Task updateTaskStatus(@PathVariable Long taskId,
                                 @RequestParam String status) {
        return taskService.updateTaskStatus(taskId, status);
    }
}

