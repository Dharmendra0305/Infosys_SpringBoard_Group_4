package com.epsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "goods_receipts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GoodsReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "po_id")
    private Long poId;

    @Column(name = "receipt_number")
    private String receiptNumber;

    @Column(name = "received_by")
    private Long receivedBy;

    @Column(name = "received_date")
    private java.time.LocalDate receivedDate;

    @Column(name = "remarks")
    private String remarks;

}
