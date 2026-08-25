package com.epsystem.repository;

import com.epsystem.entity.SpendSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpendSummaryRepository extends JpaRepository<SpendSummary, Long> {
}
