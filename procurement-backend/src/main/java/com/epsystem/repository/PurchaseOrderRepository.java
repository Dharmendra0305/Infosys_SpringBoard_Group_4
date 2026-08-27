package com.epsystem.repository;

import com.epsystem.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    /**
     * A lean projection (department name, amount, created_at) for every PO
     * that counts as real spend - not the full entity, just the three
     * columns Statistics actually needs, joined through the requisition to
     * reach the department. Excludes CANCELLED: a cancelled PO never
     * represents real committed spend. Everything else (CREATED through
     * CLOSED, including DISPUTED) still counts - the order was placed and
     * the money is committed even while a delivery dispute is being sorted out.
     */
    @Query(value =
            "SELECT d.name AS departmentName, po.total_amount AS amount, po.created_at AS createdAt " +
            "FROM purchase_orders po " +
            "JOIN purchase_requisitions pr ON po.requisition_id = pr.id " +
            "JOIN departments d ON pr.department_id = d.id " +
            "WHERE po.status <> 'CANCELLED'",
            nativeQuery = true)
    List<SpendRow> findSpendRows();

    interface SpendRow {
        String getDepartmentName();
        BigDecimal getAmount();
        LocalDateTime getCreatedAt();
    }
}
