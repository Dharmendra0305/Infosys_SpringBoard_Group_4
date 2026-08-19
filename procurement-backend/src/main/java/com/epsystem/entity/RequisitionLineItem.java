package com.epsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "requisition_line_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RequisitionLineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "requisition_id")
    private Long requisitionId;

    @Column(name = "item_description")
    private String itemDescription;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "unit_price")
    private java.math.BigDecimal unitPrice;

    @Column(name = "line_total")
    private java.math.BigDecimal lineTotal;

    @Column(name = "category_id")
    private Long categoryId;

}
