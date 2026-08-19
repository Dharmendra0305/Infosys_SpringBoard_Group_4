package com.epsystem.repository;

import com.epsystem.entity.ApprovalLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApprovalLevelRepository extends JpaRepository<ApprovalLevel, Long> {
}
