package com.epsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "po_status_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PoStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "po_id")
    private Long poId;

    @Column(name = "old_status")
    private String oldStatus;

    @Column(name = "new_status")
    private String newStatus;

    @Column(name = "changed_by")
    private Long changedBy;

    @Column(name = "remarks")
    private String remarks;

}
