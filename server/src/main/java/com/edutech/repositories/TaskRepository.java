package com.edutech.repositories;

import com.edutech.entities.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByAssignedStaffId(Long staffId);

    // ✅ NEW
    List<Task> findByEventId(Long eventId);

    // ✅ NEW (for auto-complete when event completes)
    List<Task> findByEventIdAndStatusNot(Long eventId, String status);
}