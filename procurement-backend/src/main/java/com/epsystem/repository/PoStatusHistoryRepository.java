package com.epsystem.repository;

import com.epsystem.entity.PoStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PoStatusHistoryRepository extends JpaRepository<PoStatusHistory, Long> {
}
