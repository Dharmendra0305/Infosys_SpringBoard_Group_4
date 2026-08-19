package com.epsystem.service;

import com.epsystem.dto.ApprovalActionRequest;
import com.epsystem.dto.RequisitionRequest;
import com.epsystem.entity.*;
import com.epsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Module 2: Procurement Workflow Automation.
 *
 * The approval chain is entirely data-driven: ApprovalHierarchyRule +
 * ApprovalLevel rows decide how many approval steps a requisition needs
 * and which role approves each step. Changing a threshold is a data
 * change (a row in approval_hierarchy_rules), never a code change.
 */
@Service
@RequiredArgsConstructor
public class RequisitionService {

    private final PurchaseRequisitionRepository requisitionRepository;
    private final RequisitionLineItemRepository lineItemRepository;
    private final RequisitionApprovalRepository approvalRepository;
    private final RequisitionStatusHistoryRepository historyRepository;
    private final ApprovalHierarchyRuleRepository ruleRepository;
    private final ApprovalLevelRepository approvalLevelRepository;
    private final UserRoleRepository userRoleRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final CostCenterRepository costCenterRepository;
    private final ProcurementCategoryRepository categoryRepository;
    private final AuditService auditService;

    @Transactional
    public PurchaseRequisition createAndSubmit(RequisitionRequest req) {
        // ---- validation: fail with a clear message before touching the database ----
        Employee requester = employeeRepository.findById(req.getRequestedBy())
                .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + req.getRequestedBy()));

        if (req.getDeliveryAddress() == null || req.getDeliveryAddress().isBlank()) {
            throw new IllegalStateException("A delivery address is required - the supplier needs to know where to send the order");
        }

        if (!departmentRepository.existsById(req.getDepartmentId())) {
            throw new IllegalArgumentException("Department not found: " + req.getDepartmentId());
        }
        if (!costCenterRepository.existsById(req.getCostCenterId())) {
            throw new IllegalArgumentException("Cost center not found: " + req.getCostCenterId());
        }
        if (!categoryRepository.existsById(req.getCategoryId())) {
            throw new IllegalArgumentException("Procurement category not found: " + req.getCategoryId());
        }
        if (req.getLineItems() == null || req.getLineItems().isEmpty()) {
            throw new IllegalStateException("A requisition needs at least one line item");
        }
        for (RequisitionRequest.LineItem li : req.getLineItems()) {
            if (li.getQuantity() == null || li.getQuantity() <= 0) {
                throw new IllegalStateException("Line item \"" + li.getItemDescription() + "\" needs a quantity greater than zero");
            }
            if (li.getUnitPrice() == null || li.getUnitPrice().signum() < 0) {
                throw new IllegalStateException("Line item \"" + li.getItemDescription() + "\" has an invalid unit price");
            }
            if (!categoryRepository.existsById(li.getCategoryId())) {
                throw new IllegalArgumentException("Category not found for line item: " + li.getItemDescription());
            }
        }

        // ---- calculate total, then find the approval chain this amount requires ----
        BigDecimal total = req.getLineItems().stream()
                .map(li -> li.getUnitPrice().multiply(BigDecimal.valueOf(li.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        ApprovalHierarchyRule rule = findMatchingRule(total, req.getCategoryId(), req.getDepartmentId());

        PurchaseRequisition requisition = PurchaseRequisition.builder()
                .requisitionNumber(generateRequisitionNumber())
                .requestedBy(req.getRequestedBy())
                .departmentId(req.getDepartmentId())
                .costCenterId(req.getCostCenterId())
                .categoryId(req.getCategoryId())
                .status("IN_APPROVAL")
                .totalAmount(total)
                .justification(req.getJustification())
                .deliveryAddress(req.getDeliveryAddress())
                .appliedRuleId(rule.getId())
                .currentApprovalLevel(1)
                .build();
        requisition = requisitionRepository.save(requisition);

        for (RequisitionRequest.LineItem li : req.getLineItems()) {
            lineItemRepository.save(RequisitionLineItem.builder()
                    .requisitionId(requisition.getId())
                    .itemDescription(li.getItemDescription())
                    .quantity(li.getQuantity())
                    .unitPrice(li.getUnitPrice())
                    .lineTotal(li.getUnitPrice().multiply(BigDecimal.valueOf(li.getQuantity())))
                    .categoryId(li.getCategoryId())
                    .build());
        }

        // Seed a PENDING approval row for every level defined on the matched rule -
        // this is also how the "next approver" is found: whoever is PENDING at
        // the requisition's current_approval_level.
        List<ApprovalLevel> levels = approvalLevelRepository.findAll().stream()
                .filter(l -> l.getRuleId().equals(rule.getId()))
                .sorted((a, b) -> a.getLevelNumber().compareTo(b.getLevelNumber()))
                .toList();

        for (ApprovalLevel level : levels) {
            Long approverId = resolveApprover(level.getApproverRoleId(), req.getDepartmentId());
            approvalRepository.save(RequisitionApproval.builder()
                    .requisitionId(requisition.getId())
                    .levelNumber(level.getLevelNumber())
                    .approverId(approverId)
                    .action("PENDING")
                    .build());
        }

        logStatusChange(requisition.getId(), "DRAFT", "IN_APPROVAL", req.getRequestedBy(),
                "Submitted by " + requester.getFirstName() + " " + requester.getLastName()
                        + " - matched rule requires " + levels.size() + " approval level(s)");

        auditService.log("purchase_requisitions", requisition.getId(), "CREATE", req.getRequestedBy(),
                null, "status=IN_APPROVAL, total=" + total + ", levels=" + levels.size());

        // In-app "notification": the assigned approver for level 1 will see this
        // requisition surface on their own /my-pending dashboard immediately -
        // there's no separate email/SMS layer, the pending-approval query IS the notification.
        return requisition;
    }

    @Transactional
    public PurchaseRequisition decide(Long requisitionId, ApprovalActionRequest action) {
        PurchaseRequisition requisition = requisitionRepository.findById(requisitionId)
                .orElseThrow(() -> new IllegalArgumentException("Requisition not found: " + requisitionId));

        if (!"IN_APPROVAL".equals(requisition.getStatus())) {
            throw new IllegalStateException("Requisition is not awaiting approval, current status: " + requisition.getStatus());
        }
        if (action.getAction() == null || !List.of("APPROVED", "REJECTED").contains(action.getAction().toUpperCase())) {
            throw new IllegalStateException("Decision must be APPROVED or REJECTED, got: " + action.getAction());
        }

        int currentLevel = requisition.getCurrentApprovalLevel();
        RequisitionApproval pending = approvalRepository.findAll().stream()
                .filter(a -> a.getRequisitionId().equals(requisitionId)
                        && a.getLevelNumber().equals(currentLevel)
                        && "PENDING".equals(a.getAction()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No pending approval at level " + currentLevel));

        if (pending.getApproverId() != null && !pending.getApproverId().equals(action.getApproverId())) {
            throw new IllegalStateException(
                    "This level is assigned to a different approver - you are not authorized to act on it");
        }

        pending.setAction(action.getAction());
        pending.setComments(action.getComments());
        pending.setActionDate(LocalDateTime.now());
        approvalRepository.save(pending);

        auditService.log("requisition_approvals", pending.getId(), action.getAction(), action.getApproverId(),
                "action=PENDING", "action=" + action.getAction() + (action.getComments() != null ? ", comments=" + action.getComments() : ""));

        if ("REJECTED".equalsIgnoreCase(action.getAction())) {
            String old = requisition.getStatus();
            requisition.setStatus("REJECTED");
            requisitionRepository.save(requisition);
            logStatusChange(requisitionId, old, "REJECTED", action.getApproverId(), action.getComments());
            auditService.log("purchase_requisitions", requisitionId, "REJECT", action.getApproverId(), "status=" + old, "status=REJECTED");
            return requisition;
        }

        // approved at this level -> is there a next level?
        long totalLevels = approvalRepository.findAll().stream()
                .filter(a -> a.getRequisitionId().equals(requisitionId)).count();

        if (currentLevel < totalLevels) {
            requisition.setCurrentApprovalLevel(currentLevel + 1);
            requisitionRepository.save(requisition);
            // Notification equivalent: the next level's PENDING row already exists
            // (seeded at creation) and now surfaces on that approver's dashboard.
        } else {
            String old = requisition.getStatus();
            requisition.setStatus("APPROVED");
            requisitionRepository.save(requisition);
            logStatusChange(requisitionId, old, "APPROVED", action.getApproverId(), "Final approval granted");
            auditService.log("purchase_requisitions", requisitionId, "APPROVE", action.getApproverId(), "status=" + old, "status=APPROVED");
        }

        return requisition;
    }

    public List<PurchaseRequisition> findAll() {
        return requisitionRepository.findAll();
    }

    public Optional<PurchaseRequisition> findById(Long id) {
        return requisitionRepository.findById(id);
    }

    /** For the Employee dashboard's "My Requisitions". */
    public List<PurchaseRequisition> findMine(Long employeeId) {
        return requisitionRepository.findAll().stream()
                .filter(r -> r.getRequestedBy().equals(employeeId))
                .toList();
    }

    /**
     * For Manager/Senior Manager/Department Head/Finance/CEO dashboards'
     * "Pending Approvals": every requisition where this employee is the
     * PENDING approver at the current level right now.
     */
    public List<PurchaseRequisition> findPendingFor(Long employeeId) {
        List<Long> reqIdsAwaitingMe = approvalRepository.findAll().stream()
                .filter(a -> "PENDING".equals(a.getAction()) && employeeId.equals(a.getApproverId()))
                .map(RequisitionApproval::getRequisitionId)
                .toList();

        return requisitionRepository.findAll().stream()
                .filter(r -> "IN_APPROVAL".equals(r.getStatus()) && reqIdsAwaitingMe.contains(r.getId()))
                .filter(r -> approvalRepository.findAll().stream()
                        .anyMatch(a -> a.getRequisitionId().equals(r.getId())
                                && a.getLevelNumber().equals(r.getCurrentApprovalLevel())
                                && "PENDING".equals(a.getAction())
                                && employeeId.equals(a.getApproverId())))
                .toList();
    }

    // ---- helpers ----

    private ApprovalHierarchyRule findMatchingRule(BigDecimal amount, Long categoryId, Long departmentId) {
        return ruleRepository.findAll().stream()
                .filter(ApprovalHierarchyRule::getIsActive)
                .filter(r -> amount.compareTo(r.getMinAmount()) >= 0 && amount.compareTo(r.getMaxAmount()) <= 0)
                .filter(r -> r.getCategoryId() == null || r.getCategoryId().equals(categoryId))
                .filter(r -> r.getDepartmentId() == null || r.getDepartmentId().equals(departmentId))
                // prefer the most specific rule: department+category match beats generic
                .sorted((a, b) -> specificity(b) - specificity(a))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "No approval rule configured for amount " + amount + " - add one to approval_hierarchy_rules"));
    }

    private int specificity(ApprovalHierarchyRule r) {
        int score = 0;
        if (r.getCategoryId() != null) score++;
        if (r.getDepartmentId() != null) score++;
        return score;
    }

    /**
     * Picks who approves a given level: prefers an employee holding the role
     * within the requisition's own department (e.g. that department's Manager
     * or Senior Manager), and falls back to any holder of the role for
     * org-wide roles like Finance or CEO that aren't department-scoped.
     */
    private Long resolveApprover(Long roleId, Long departmentId) {
        List<Long> holderIds = userRoleRepository.findAll().stream()
                .filter(ur -> ur.getRoleId().equals(roleId))
                .map(UserRole::getEmployeeId)
                .toList();

        return holderIds.stream()
                .map(id -> employeeRepository.findById(id).orElse(null))
                .filter(e -> e != null && e.getDepartmentId() != null && e.getDepartmentId().equals(departmentId))
                .map(Employee::getId)
                .findFirst()
                .orElseGet(() -> holderIds.stream().findFirst().orElse(null));
    }

    private String generateRequisitionNumber() {
        return "REQ-" + java.time.Year.now() + "-" + String.format("%04d", requisitionRepository.count() + 1);
    }

    private void logStatusChange(Long requisitionId, String oldStatus, String newStatus, Long changedBy, String remarks) {
        historyRepository.save(RequisitionStatusHistory.builder()
                .requisitionId(requisitionId)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .changedBy(changedBy)
                .remarks(remarks)
                .build());
    }
}
