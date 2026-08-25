package com.epsystem.controller;

import com.epsystem.entity.GoodsReceipt;
import com.epsystem.entity.PurchaseOrder;
import com.epsystem.security.AuthenticatedEmployee;
import com.epsystem.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping
    public List<PurchaseOrder> all() {
        return purchaseOrderService.findAll();
    }

    // body: { "requisitionId": 2, "supplierId": 2, "expectedDeliveryDate": "2026-08-15" }
    // createdBy comes from the token, not the body.
    @PostMapping("/from-requisition")
    public PurchaseOrder convert(@RequestBody Map<String, Object> body,
                                  @AuthenticationPrincipal AuthenticatedEmployee me) {
        return purchaseOrderService.convertToPO(
                Long.valueOf(body.get("requisitionId").toString()),
                Long.valueOf(body.get("supplierId").toString()),
                me.employeeId(),
                LocalDate.parse(body.get("expectedDeliveryDate").toString())
        );
    }

    @PostMapping("/{id}/status")
    public PurchaseOrder updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body,
                                       @AuthenticationPrincipal AuthenticatedEmployee me) {
        return purchaseOrderService.requestManualStatusChange(id, body.get("status"), me.employeeId(), body.get("remarks"));
    }

    // body: { "poLineItemId": 1, "quantityReceived": 4, "conditionNotes": "ok" }
    @PostMapping("/{id}/receipts")
    public GoodsReceipt receiveGoods(@PathVariable Long id, @RequestBody Map<String, Object> body,
                                      @AuthenticationPrincipal AuthenticatedEmployee me) {
        return purchaseOrderService.recordReceipt(
                id,
                Long.valueOf(body.get("poLineItemId").toString()),
                Integer.valueOf(body.get("quantityReceived").toString()),
                me.employeeId(),
                (String) body.get("conditionNotes")
        );
    }
}
