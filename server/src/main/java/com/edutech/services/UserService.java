package com.edutech.services;

import com.edutech.entities.Client;
import com.edutech.entities.EventPlanner;
import com.edutech.entities.Staff;
import com.edutech.entities.User;
import com.edutech.repositories.ClientRepository;
import com.edutech.repositories.EventPlannerRepository;
import com.edutech.repositories.StaffRepository;
import com.edutech.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventPlannerRepository eventPlannerRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Registers a new user based on role
     */
    public User registerUser(User user) {

        User targetUser;

        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Create object based on role
        if (user.getRole().equalsIgnoreCase("PLANNER")) {
            targetUser = new EventPlanner();
        } else if (user.getRole().equalsIgnoreCase("STAFF")) {
            targetUser = new Staff();
        } else if (user.getRole().equalsIgnoreCase("CLIENT")) {
            targetUser = new Client();
        } else {
            throw new RuntimeException("Invalid Role");
        }

        copyProperties(user, targetUser);

        // Save based on actual type
        if (targetUser instanceof EventPlanner) {
            return eventPlannerRepository.save((EventPlanner) targetUser);
        } else if (targetUser instanceof Staff) {
            return staffRepository.save((Staff) targetUser);
        } else {
            return clientRepository.save((Client) targetUser);
        }
    }

    /**
     * Fetch user by username
     */
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not Found"));
    }

    /**
     * Used by Spring Security for authentication
     */
    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = getUserByUsername(username);

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole())
                .build();
    }

    /**
     * Copy properties from source to target using getters & setters
     */
    private void copyProperties(User source, User target) {
        target.setUsername(source.getUsername());
        target.setEmail(source.getEmail());
        target.setPassword(source.getPassword());
        target.setRole(source.getRole());
    }
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    
public boolean existsByEmail(String email) {
    return userRepository.existsByEmail(email);
}

// ✅ update password by email (BCrypt)
public void updatePasswordByEmail(String email, String newPassword) {
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Invalid email"));

    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);
}

}