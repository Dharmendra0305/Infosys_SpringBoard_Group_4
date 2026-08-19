package com.epsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "approval_levels")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApprovalLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rule_id")
    private Long ruleId;

    @Column(name = "level_number")
    private Integer levelNumber;

    @Column(name = "approver_role_id")
    private Long approverRoleId;

}
