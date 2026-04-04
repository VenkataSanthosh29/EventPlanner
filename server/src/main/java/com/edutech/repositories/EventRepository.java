package com.edutech.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.edutech.entities.Event;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event,Long> {
   List<Event> findByPlannerId(Long plannerId);
   @Query("SELECT AVG(e.rating) FROM Event e WHERE e.rating IS NOT NULL")
   Double findAverageRating();
   @Query("SELECT AVG(e.rating) FROM Event e WHERE e.planner.id = :plannerId AND e.rating IS NOT NULL")
   Double findAverageRatingByPlanner(@Param("plannerId") Long plannerId);

   long countByPlannerId(Long plannerId);
}
