// package com.edutech.controllers;


// import com.edutech.dto.LoginRequest;
// import com.edutech.dto.LoginResponse;
// import com.edutech.entities.User;
// import com.edutech.jwt.JwtUtil;
// import com.edutech.services.UserService;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.AuthenticationException;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RestController;
// import org.springframework.web.server.ResponseStatusException;


// public class RegisterAndLoginController {

//     // write the code here
// }



//set2
// package com.edutech.controllers;

// import com.edutech.dto.LoginRequest;
// import com.edutech.dto.LoginResponse;
// import com.edutech.entities.User;
// import com.edutech.jwt.JwtUtil;
// import com.edutech.services.UserService;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.*;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/user")
// public class RegisterAndLoginController {

//     @Autowired
//     private UserService userService;

//     @Autowired
//     private JwtUtil jwtUtil;

//     @PostMapping("/register")
//     public ResponseEntity<User> register(@RequestBody User user) {
//         return ResponseEntity.status(HttpStatus.CREATED)
//                 .body(userService.registerUser(user));
//     }

//     @PostMapping("/login")
//     public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

//         User user = userService.findByUsername(request.getUsername());
//         if (user == null ||
//                 !userService.matches(request.getPassword(), user.getPassword())) {
//             return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//         }

//         return ResponseEntity.ok(
//                 new LoginResponse(jwtUtil.generateToken(user.getUsername()))
//         );
//     }
// }




//set3
// package com.edutech.controllers;

// import com.edutech.dto.LoginRequest;
// import com.edutech.dto.LoginResponse;
// import com.edutech.entities.User;
// import com.edutech.jwt.JwtUtil;
// import com.edutech.services.UserService;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/user")
// public class RegisterAndLoginController {

//     @Autowired
//     private UserService userService;

//     @Autowired
//     private JwtUtil jwtUtil;

//     @PostMapping("/register")
//     public ResponseEntity<User> register(@RequestBody User user) {
//         return ResponseEntity
//                 .status(HttpStatus.CREATED)
//                 .body(userService.registerUser(user));
//     }

//     @PostMapping("/login")
//     public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

//         User user = userService.findByUsername(request.getUsername());

//         if (user == null ||
//                 !userService.matches(request.getPassword(), user.getPassword())) {
//             return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//         }

//         String token = jwtUtil.generateToken(user.getUsername());
//         return ResponseEntity.ok(new LoginResponse(token));
//     }
// }



















package com.edutech.controllers;

import com.edutech.dto.LoginRequest;
import com.edutech.dto.LoginResponse;
import com.edutech.entities.User;
import com.edutech.jwt.JwtUtil;
import com.edutech.services.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class RegisterAndLoginController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(userService.registerUser(user));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

        User user = userService.findByUsername(request.getUsername());

        // ✅ SIMPLE MATCH — test‑friendly
        if (user == null || 
            !userService.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(
                new LoginResponse(jwtUtil.generateToken(user.getUsername()))
        );
    }
}