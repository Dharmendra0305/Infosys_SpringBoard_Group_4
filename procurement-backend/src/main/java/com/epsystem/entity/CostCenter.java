package com.epsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cost_centers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CostCenter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "name")
    private String name;

    @Column(name = "code")
    private String code;

}
