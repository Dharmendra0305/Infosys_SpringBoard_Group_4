package com.epsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * The chain length and the roles in it now vary by requisition amount (see
 * V7 migration), so the frontend can no longer hardcode a fixed list of
 * role labels - it asks this endpoint instead, which resolves the role
 * name for each level from the requisition's own applied_rule_id.
 */
@Data
@AllArgsConstructor
public class ApprovalStepView {
    private Integer levelNumber;
    private String roleName;
    private Long approverId;
    private String action;
    private String comments;
    private LocalDateTime actionDate;
}
