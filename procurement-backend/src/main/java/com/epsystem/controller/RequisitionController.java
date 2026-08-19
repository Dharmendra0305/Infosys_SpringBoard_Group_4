package com.epsystem.controller;

import com.epsystem.dto.ApprovalActionRequest;
import com.epsystem.dto.ApprovalStepView;
import com.epsystem.dto.RequisitionRequest;
import com.epsystem.entity.ApprovalLevel;
import com.epsystem.entity.PurchaseRequisition;
import com.epsystem.entity.RequisitionApproval;
import com.epsystem.entity.Role;
import com.epsystem.repository.ApprovalLevelRepository;
import com.epsystem.repository.RequisitionApprovalRepository;
import com.epsystem.repository.RoleRepository;
import com.epsystem.security.AuthenticatedEmployee;
import com.epsystem.service.RequisitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requisitions")
@RequiredArgsConstructor
public class RequisitionController {

    private final RequisitionService requisitionService;
    private final RequisitionApprovalRepository approvalRepository;
    private final ApprovalLevelRepository approvalLevelRepository;
    private final RoleRepository roleRepository;

    @GetMapping
    public List<PurchaseRequisition> all() {
        return requisitionService.findAll();
    }

    // Employee dashboard: "My Requisitions"
    @GetMapping("/mine")
    public List<PurchaseRequisition> mine(@AuthenticationPrincipal AuthenticatedEmployee me) {
        return requisitionService.findMine(me.employeeId());
    }

    // Manager / Senior Manager / Department Head / Finance / CEO dashboards:
    // "Pending Approvals" - whatever is sitting at this employee's level right now.
    @GetMapping("/my-pending")
    public List<PurchaseRequisition> myPending(@AuthenticationPrincipal AuthenticatedEmployee me) {
        return requisitionService.findPendingFor(me.employeeId());
    }

    @GetMapping("/{id}")
    public PurchaseRequisition one(@PathVariable Long id) {
        return requisitionService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Requisition not found: " + id));
    }

    // The full approval chain for this requisition - who is assigned each
    // level, what role that level is, and what they decided (or PENDING).
    // The chain's length and roles depend on the requisition's amount (see
    // approval_hierarchy_rules), so the role name is resolved here rather
    // than assumed by the frontend.
    @GetMapping("/{id}/approvals")
    public List<ApprovalStepView> approvals(@PathVariable Long id) {
        PurchaseRequisition requisition = requisitionService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Requisition not found: " + id));

        Map<Integer, String> roleByLevel = approvalLevelRepository.findAll().stream()
                .filter(l -> l.getRuleId().equals(requisition.getAppliedRuleId()))
                .collect(java.util.stream.Collectors.toMap(
                        ApprovalLevel::getLevelNumber,
                        l -> roleRepository.findById(l.getApproverRoleId()).map(Role::getName).orElse("Unknown")
                ));

        return approvalRepository.findAll().stream()
                .filter(a -> a.getRequisitionId().equals(id))
                .sorted((a, b) -> a.getLevelNumber().compareTo(b.getLevelNumber()))
                .map(a -> new ApprovalStepView(
                        a.getLevelNumber(),
                        roleByLevel.getOrDefault(a.getLevelNumber(), "Unknown"),
                        a.getApproverId(),
                        a.getAction(),
                        a.getComments(),
                        a.getActionDate()
                ))
                .toList();
    }

    // requestedBy is always the signed-in employee from the token, never
    // whatever the client puts in the body - stops one employee raising a
    // requisition "as" someone else.
    @PostMapping
    public PurchaseRequisition create(@RequestBody RequisitionRequest request,
                                       @AuthenticationPrincipal AuthenticatedEmployee me) {
        request.setRequestedBy(me.employeeId());
        return requisitionService.createAndSubmit(request);
    }

    // Same idea: the approver is whoever the token says you are, not a value
    // the client could tamper with. RequisitionService still separately checks
    // that this is actually the employee assigned to the current level.
    @PostMapping("/{id}/decision")
    public PurchaseRequisition decide(@PathVariable Long id,
                                       @RequestBody ApprovalActionRequest action,
                                       @AuthenticationPrincipal AuthenticatedEmployee me) {
        action.setApproverId(me.employeeId());
        return requisitionService.decide(id, action);
    }
}
