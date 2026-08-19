package com.epsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "purchase_requisitions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurchaseRequisition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "requisition_number")
    private String requisitionNumber;

    @Column(name = "requested_by")
    private Long requestedBy;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "cost_center_id")
    private Long costCenterId;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "status")
    private String status;

    @Column(name = "total_amount")
    private java.math.BigDecimal totalAmount;

    @Column(name = "justification")
    private String justification;

    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Column(name = "applied_rule_id")
    private Long appliedRuleId;

    @Column(name = "current_approval_level")
    private Integer currentApprovalLevel;

}
