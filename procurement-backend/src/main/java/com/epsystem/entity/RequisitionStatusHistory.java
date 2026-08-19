package com.epsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "requisition_status_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RequisitionStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "requisition_id")
    private Long requisitionId;

    @Column(name = "old_status")
    private String oldStatus;

    @Column(name = "new_status")
    private String newStatus;

    @Column(name = "changed_by")
    private Long changedBy;

    @Column(name = "remarks")
    private String remarks;

}
