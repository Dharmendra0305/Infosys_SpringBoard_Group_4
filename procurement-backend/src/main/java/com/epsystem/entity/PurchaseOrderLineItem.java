package com.epsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "purchase_order_line_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurchaseOrderLineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "po_id")
    private Long poId;

    @Column(name = "requisition_line_item_id")
    private Long requisitionLineItemId;

    @Column(name = "item_description")
    private String itemDescription;

    @Column(name = "quantity_ordered")
    private Integer quantityOrdered;

    @Column(name = "quantity_received")
    private Integer quantityReceived;

    @Column(name = "unit_price")
    private java.math.BigDecimal unitPrice;

    @Column(name = "line_total")
    private java.math.BigDecimal lineTotal;

}
