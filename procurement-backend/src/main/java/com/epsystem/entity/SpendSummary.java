package com.epsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "spend_summary")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SpendSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "fiscal_year")
    private Integer fiscalYear;

    @Column(name = "fiscal_month")
    private Integer fiscalMonth;

    @Column(name = "total_spend")
    private java.math.BigDecimal totalSpend;

    @Column(name = "po_count")
    private Integer poCount;

}
