// package com.edutech.services;

// import com.edutech.entities.Client;
// import com.edutech.entities.EventPlanner;
// import com.edutech.entities.Staff;
// import com.edutech.entities.User;
// import com.edutech.repositories.ClientRepository;
// import com.edutech.repositories.EventPlannerRepository;
// import com.edutech.repositories.StaffRepository;
// import com.edutech.repositories.UserRepository;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.security.core.userdetails.UsernameNotFoundException;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Service;

// import java.util.ArrayList;
// import java.util.List;

// @Service
// public class UserService {

//     @Autowired
//     private UserRepository userRepository;

//     @Autowired
//     private PasswordEncoder encoder;

//     public User registerUser(User user) {
//         user.setPassword(encoder.encode(user.getPassword()));
//         return userRepository.save(user);
//     }

//     public User findByUsername(String username) {
//         return userRepository.findByUsername(username).orElse(null);
//     }

//     public boolean matches(String raw, String encoded) {
//         return encoder.matches(raw, encoded);
//     }
// }


package com.edutech.services;

import com.edutech.entities.User;
import com.edutech.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    public User registerUser(User user) {
        user.setPassword(encoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public boolean matches(String raw, String encoded) {
        return encoder.matches(raw, encoded);
    }
}