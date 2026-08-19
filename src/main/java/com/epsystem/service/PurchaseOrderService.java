package com.epsystem.service;

import com.epsystem.entity.*;
import com.epsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Module 3: Purchase Order Management.
 * Converts an APPROVED requisition into a PO, and tracks the PO through
 * SENT -> ACKNOWLEDGED -> PARTIALLY_DELIVERED -> DELIVERED -> CLOSED.
 */
@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseRequisitionRepository requisitionRepository;
    private final RequisitionLineItemRepository reqLineItemRepository;
    private final PurchaseOrderRepository poRepository;
    private final PurchaseOrderLineItemRepository poLineItemRepository;
    private final PoStatusHistoryRepository poHistoryRepository;
    private final RequisitionStatusHistoryRepository reqHistoryRepository;
    private final GoodsReceiptRepository goodsReceiptRepository;
    private final GoodsReceiptLineItemRepository goodsReceiptLineItemRepository;
    private final SupplierRepository supplierRepository;
    private final AuditService auditService;

    private static final List<String> VALID_STATUSES = List.of(
            "CREATED", "SENT", "ACKNOWLEDGED", "PARTIALLY_DELIVERED", "DELIVERED", "CLOSED", "DISPUTED", "CANCELLED");

    // Which statuses a PO is allowed to move to from its current one -
    // stops e.g. a CLOSED PO being silently reopened to CREATED by mistake.
    private static final java.util.Map<String, List<String>> ALLOWED_TRANSITIONS = java.util.Map.of(
            "CREATED", List.of("SENT", "CANCELLED"),
            "SENT", List.of("ACKNOWLEDGED", "DISPUTED", "CANCELLED"),
            "ACKNOWLEDGED", List.of("PARTIALLY_DELIVERED", "DELIVERED", "DISPUTED"),
            "PARTIALLY_DELIVERED", List.of("DELIVERED", "DISPUTED"),
            "DELIVERED", List.of("CLOSED"),
            "DISPUTED", List.of("SENT", "CANCELLED")
    );

    @Transactional
    public PurchaseOrder convertToPO(Long requisitionId, Long supplierId, Long createdBy, LocalDate expectedDeliveryDate) {
        PurchaseRequisition requisition = requisitionRepository.findById(requisitionId)
                .orElseThrow(() -> new IllegalArgumentException("Requisition not found: " + requisitionId));

        if (!"APPROVED".equals(requisition.getStatus())) {
            throw new IllegalStateException("Only APPROVED requisitions can be converted to a PO, current status: "
                    + requisition.getStatus());
        }

        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found: " + supplierId));
        if (!"ACTIVE".equals(supplier.getStatus())) {
            throw new IllegalStateException("Supplier \"" + supplier.getName() + "\" is " + supplier.getStatus()
                    + " and can't receive new purchase orders");
        }
        if (expectedDeliveryDate == null || expectedDeliveryDate.isBefore(LocalDate.now())) {
            throw new IllegalStateException("Expected delivery date must be today or later");
        }

        List<RequisitionLineItem> lineItems = reqLineItemRepository.findAll().stream()
                .filter(li -> li.getRequisitionId().equals(requisitionId))
                .toList();
        if (lineItems.isEmpty()) {
            throw new IllegalStateException("Requisition has no line items to convert");
        }

        PurchaseOrder po = PurchaseOrder.builder()
                .poNumber(generatePoNumber())
                .requisitionId(requisitionId)
                .supplierId(supplierId)
                .status("CREATED")
                .totalAmount(requisition.getTotalAmount())
                .expectedDeliveryDate(expectedDeliveryDate)
                .deliveryAddress(requisition.getDeliveryAddress())
                .createdBy(createdBy)
                .build();
        po = poRepository.save(po);

        for (RequisitionLineItem li : lineItems) {
            poLineItemRepository.save(PurchaseOrderLineItem.builder()
                    .poId(po.getId())
                    .requisitionLineItemId(li.getId())
                    .itemDescription(li.getItemDescription())
                    .quantityOrdered(li.getQuantity())
                    .quantityReceived(0)
                    .unitPrice(li.getUnitPrice())
                    .lineTotal(li.getLineTotal())
                    .build());
        }

        String oldReqStatus = requisition.getStatus();
        requisition.setStatus("CONVERTED_TO_PO");
        requisitionRepository.save(requisition);
        reqHistoryRepository.save(RequisitionStatusHistory.builder()
                .requisitionId(requisitionId)
                .oldStatus(oldReqStatus)
                .newStatus("CONVERTED_TO_PO")
                .changedBy(createdBy)
                .remarks("Converted to " + po.getPoNumber())
                .build());

        auditService.log("purchase_orders", po.getId(), "CREATE", createdBy,
                null, "status=CREATED, supplier=" + supplier.getName() + ", total=" + po.getTotalAmount());

        return po;
    }

    @Transactional
    public PurchaseOrder updateStatus(Long poId, String newStatus, Long changedBy, String remarks) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new IllegalArgumentException("PO not found: " + poId));

        if (newStatus == null || !VALID_STATUSES.contains(newStatus)) {
            throw new IllegalStateException("Unknown PO status: " + newStatus);
        }
        String old = po.getStatus();
        List<String> allowed = ALLOWED_TRANSITIONS.getOrDefault(old, List.of());
        if (!allowed.contains(newStatus)) {
            throw new IllegalStateException("Can't move a PO from " + old + " to " + newStatus
                    + " - allowed next steps: " + (allowed.isEmpty() ? "none, this is a final state" : allowed));
        }

        po.setStatus(newStatus);
        poRepository.save(po);
        poHistoryRepository.save(PoStatusHistory.builder()
                .poId(poId).oldStatus(old).newStatus(newStatus).changedBy(changedBy).remarks(remarks).build());
        auditService.log("purchase_orders", poId, "STATUS_CHANGE", changedBy, "status=" + old, "status=" + newStatus);
        return po;
    }

    /**
     * Record a goods receipt against a PO line item, bump quantity_received,
     * and roll the PO status up to PARTIALLY_DELIVERED or DELIVERED.
     */
    @Transactional
    public GoodsReceipt recordReceipt(Long poId, Long poLineItemId, Integer quantityReceived,
                                       Long receivedBy, String conditionNotes) {
        PurchaseOrderLineItem line = poLineItemRepository.findById(poLineItemId)
                .orElseThrow(() -> new IllegalArgumentException("PO line item not found: " + poLineItemId));

        if (!line.getPoId().equals(poId)) {
            throw new IllegalStateException("That line item doesn't belong to this purchase order");
        }
        if (quantityReceived == null || quantityReceived <= 0) {
            throw new IllegalStateException("Quantity received must be greater than zero");
        }
        int remaining = line.getQuantityOrdered() - line.getQuantityReceived();
        if (quantityReceived > remaining) {
            throw new IllegalStateException("Only " + remaining + " unit(s) remain on \"" + line.getItemDescription()
                    + "\" - can't receive " + quantityReceived);
        }

        GoodsReceipt receipt = goodsReceiptRepository.save(GoodsReceipt.builder()
                .poId(poId)
                .receiptNumber(generateReceiptNumber())
                .receivedBy(receivedBy)
                .receivedDate(LocalDate.now())
                .remarks(conditionNotes)
                .build());

        goodsReceiptLineItemRepository.save(GoodsReceiptLineItem.builder()
                .goodsReceiptId(receipt.getId())
                .poLineItemId(poLineItemId)
                .quantityReceived(quantityReceived)
                .conditionNotes(conditionNotes)
                .build());

        line.setQuantityReceived(line.getQuantityReceived() + quantityReceived);
        poLineItemRepository.save(line);

        List<PurchaseOrderLineItem> allLines = poLineItemRepository.findAll().stream()
                .filter(l -> l.getPoId().equals(poId)).toList();
        boolean fullyReceived = allLines.stream()
                .allMatch(l -> l.getQuantityReceived() >= l.getQuantityOrdered());
        boolean anyReceived = allLines.stream().anyMatch(l -> l.getQuantityReceived() > 0);

        String newStatus = fullyReceived ? "DELIVERED" : anyReceived ? "PARTIALLY_DELIVERED" : "SENT";
        updateStatus(poId, newStatus, receivedBy, "Goods receipt " + receipt.getReceiptNumber() + " recorded");

        auditService.log("goods_receipts", receipt.getId(), "CREATE", receivedBy,
                null, "qty=" + quantityReceived + " on PO line " + poLineItemId);

        return receipt;
    }

    public List<PurchaseOrder> findAll() {
        return poRepository.findAll();
    }

    private String generatePoNumber() {
        return "PO-" + java.time.Year.now() + "-" + String.format("%04d", poRepository.count() + 1);
    }

    private String generateReceiptNumber() {
        return "GRN-" + java.time.Year.now() + "-" + String.format("%04d", goodsReceiptRepository.count() + 1);
    }
}
