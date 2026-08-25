package com.epsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "goods_receipt_line_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GoodsReceiptLineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "goods_receipt_id")
    private Long goodsReceiptId;

    @Column(name = "po_line_item_id")
    private Long poLineItemId;

    @Column(name = "quantity_received")
    private Integer quantityReceived;

    @Column(name = "condition_notes")
    private String conditionNotes;

}
