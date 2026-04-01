package com.edutech.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.entities.Event;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event,Long> {
   List<Event> findByPlannerId(Long plannerId);
   // write the code here
}
