package com.epsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "purchase_orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "po_number")
    private String poNumber;

    @Column(name = "requisition_id")
    private Long requisitionId;

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "status")
    private String status;

    @Column(name = "total_amount")
    private java.math.BigDecimal totalAmount;

    @Column(name = "expected_delivery_date")
    private java.time.LocalDate expectedDeliveryDate;

    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Column(name = "created_by")
    private Long createdBy;

    // Column already existed in the schema (DEFAULT CURRENT_TIMESTAMP) but was
    // never mapped until Statistics needed real month-by-month grouping.
    // insertable/updatable = false because MySQL sets it, not the app.
    @Column(name = "created_at", insertable = false, updatable = false)
    private java.time.LocalDateTime createdAt;

}
