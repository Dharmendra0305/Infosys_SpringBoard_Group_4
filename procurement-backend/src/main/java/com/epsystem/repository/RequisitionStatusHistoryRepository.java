package com.epsystem.repository;

import com.epsystem.entity.RequisitionStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RequisitionStatusHistoryRepository extends JpaRepository<RequisitionStatusHistory, Long> {
}
