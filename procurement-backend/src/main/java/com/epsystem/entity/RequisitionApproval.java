package com.epsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "requisition_approvals")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RequisitionApproval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "requisition_id")
    private Long requisitionId;

    @Column(name = "level_number")
    private Integer levelNumber;

    @Column(name = "approver_id")
    private Long approverId;

    @Column(name = "action")
    private String action;

    @Column(name = "comments")
    private String comments;

    @Column(name = "action_date")
    private java.time.LocalDateTime actionDate;

}
