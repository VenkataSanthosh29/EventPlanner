package com.edutech.controllers;

import com.edutech.dto.StaffProfileDto;
import com.edutech.entities.User;
import com.edutech.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff")
public class StaffProfileController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<StaffProfileDto> getStaffProfile(@RequestParam Long staffId) {

        User user = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        if (!"STAFF".equals(user.getRole())) {
            throw new RuntimeException("User is not staff");
        }

        StaffProfileDto dto = new StaffProfileDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole()
        );

        return ResponseEntity.ok(dto);
    }
}