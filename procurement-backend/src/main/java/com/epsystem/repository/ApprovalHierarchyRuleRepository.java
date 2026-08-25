package com.epsystem.repository;

import com.epsystem.entity.ApprovalHierarchyRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApprovalHierarchyRuleRepository extends JpaRepository<ApprovalHierarchyRule, Long> {
}
