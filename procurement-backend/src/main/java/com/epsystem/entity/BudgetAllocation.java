package com.epsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "budget_allocations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BudgetAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "cost_center_id")
    private Long costCenterId;

    @Column(name = "fiscal_year")
    private Integer fiscalYear;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "allocated_amount")
    private java.math.BigDecimal allocatedAmount;

    @Column(name = "consumed_amount")
    private java.math.BigDecimal consumedAmount;

}
