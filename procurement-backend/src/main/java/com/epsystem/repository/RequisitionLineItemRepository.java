package com.epsystem.repository;

import com.epsystem.entity.RequisitionLineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RequisitionLineItemRepository extends JpaRepository<RequisitionLineItem, Long> {
}
