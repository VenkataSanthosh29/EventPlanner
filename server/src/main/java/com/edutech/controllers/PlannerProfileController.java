package com.edutech.controllers;

import com.edutech.dto.PlannerProfileDto;
import com.edutech.entities.User;
import com.edutech.repositories.EventRepository;
import com.edutech.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/planner")
public class PlannerProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @GetMapping("/profile")
    public ResponseEntity<PlannerProfileDto> getPlannerProfile(@RequestParam Long plannerId) {

        User user = userRepository.findById(plannerId)
                .orElseThrow(() -> new RuntimeException("Planner not found"));

        if (!"PLANNER".equals(user.getRole())) {
            throw new RuntimeException("User is not a planner");
        }

        long eventCount = eventRepository.countByPlannerId(plannerId);
        Double avg = eventRepository.findAverageRatingByPlanner(plannerId);
        double avgRating = (avg == null) ? 0.0 : avg;

        PlannerProfileDto dto = new PlannerProfileDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                eventCount,
                avgRating
        );

        return ResponseEntity.ok(dto);
    }
}