// package com.edutech.controllers;

// import com.edutech.entities.Event;
// import com.edutech.services.EventService;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;


// public class ClientController {

//     // write the code here
// }

package com.edutech.controllers;

import com.edutech.entities.Event;
import com.edutech.services.EventService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client")
public class ClientController {

    @Autowired
    private EventService eventService;

    @GetMapping("/events")
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    @PutMapping("/event/{id}")
    public Event updateFeedback(@PathVariable Long id,
                                @RequestParam String feedback) {
        return eventService.updateFeedback(id, feedback);
    }
}