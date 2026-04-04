package com.edutech.controllers;

import com.edutech.dto.ClientProfileDto;
import com.edutech.entities.User;
import com.edutech.repositories.EventRequestRepository;
import com.edutech.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/client")
public class ClientProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRequestRepository requestRepository;

    @GetMapping("/profile")
    public ResponseEntity<ClientProfileDto> getClientProfile(@RequestParam Long clientId) {

        User user = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        if (!"CLIENT".equals(user.getRole())) {
            throw new RuntimeException("User is not a client");
        }

        long acceptedCount = requestRepository.countByClientIdAndStatus(clientId, "ACCEPTED");

        ClientProfileDto dto = new ClientProfileDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                acceptedCount
        );

        return ResponseEntity.ok(dto);
    }
}