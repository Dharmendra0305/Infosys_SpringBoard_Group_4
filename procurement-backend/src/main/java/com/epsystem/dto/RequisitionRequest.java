package com.epsystem.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class RequisitionRequest {
    private Long requestedBy;
    private Long departmentId;
    private Long costCenterId;
    private Long categoryId;
    private String justification;
    private String deliveryAddress;
    private List<LineItem> lineItems;

    @Data
    public static class LineItem {
        private String itemDescription;
        private Integer quantity;
        private BigDecimal unitPrice;
        private Long categoryId;
    }
}
