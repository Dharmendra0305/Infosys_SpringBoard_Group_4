package com.epsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "supplier_contacts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SupplierContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "contact_name")
    private String contactName;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "is_primary")
    private Boolean isPrimary;

}
