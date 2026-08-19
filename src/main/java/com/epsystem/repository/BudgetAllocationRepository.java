package com.epsystem.repository;

import com.epsystem.entity.BudgetAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BudgetAllocationRepository extends JpaRepository<BudgetAllocation, Long> {
}
