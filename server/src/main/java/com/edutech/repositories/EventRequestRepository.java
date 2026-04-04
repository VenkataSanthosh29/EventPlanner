package com.edutech.repositories;

import com.edutech.entities.EventRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventRequestRepository extends JpaRepository<EventRequest, Long> {

    List<EventRequest> findByPlannerIdOrderByCreatedAtDesc(Long plannerId);

    List<EventRequest> findByClientIdOrderByCreatedAtDesc(Long clientId);

    long countByClientIdAndStatus(Long clientId, String status);
}