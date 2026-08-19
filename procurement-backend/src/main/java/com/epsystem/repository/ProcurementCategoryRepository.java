package com.epsystem.repository;

import com.epsystem.entity.ProcurementCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcurementCategoryRepository extends JpaRepository<ProcurementCategory, Long> {
}
