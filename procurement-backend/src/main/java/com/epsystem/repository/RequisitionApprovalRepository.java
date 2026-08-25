package com.epsystem.repository;

import com.epsystem.entity.RequisitionApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RequisitionApprovalRepository extends JpaRepository<RequisitionApproval, Long> {
}
