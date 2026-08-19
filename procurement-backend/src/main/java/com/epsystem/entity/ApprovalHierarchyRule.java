package com.epsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "approval_hierarchy_rules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApprovalHierarchyRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "min_amount")
    private java.math.BigDecimal minAmount;

    @Column(name = "max_amount")
    private java.math.BigDecimal maxAmount;

    @Column(name = "approval_levels_required")
    private Integer approvalLevelsRequired;

    @Column(name = "is_active")
    private Boolean isActive;

}
