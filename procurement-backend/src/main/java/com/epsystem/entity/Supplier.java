package com.epsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "suppliers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "supplier_code")
    private String supplierCode;

    @Column(name = "tax_id")
    private String taxId;

    @Column(name = "status")
    private String status;

    @Column(name = "payment_terms")
    private String paymentTerms;

    @Column(name = "rating")
    private java.math.BigDecimal rating;

}
