package com.epsystem.dto;

import lombok.Data;

@Data
public class ApprovalActionRequest {
    private Long approverId;
    private String action;   // APPROVED or REJECTED
    private String comments;
}
