package com.epsystem.repository;

import com.epsystem.entity.GoodsReceiptLineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GoodsReceiptLineItemRepository extends JpaRepository<GoodsReceiptLineItem, Long> {
}
