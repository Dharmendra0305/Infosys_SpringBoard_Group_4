package com.epsystem.controller;

import com.epsystem.entity.*;
import com.epsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Module 4: Procurement Analytics & Reporting.
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportingController {

    private final SpendSummaryRepository spendSummaryRepository;
    private final BudgetAllocationRepository budgetAllocationRepository;
    private final DepartmentRepository departmentRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    @GetMapping("/spend-summary")
    public List<SpendSummary> spendSummary() {
        return spendSummaryRepository.findAll();
    }

    // consumed_amount on the stored row is a seeded value nothing keeps in
    // sync as real POs happen - so it's recomputed here from actual PO spend
    // (by department + fiscal year) on every request instead of trusting
    // whatever number happens to be sitting in the column.
    @GetMapping("/budget-allocations")
    public List<BudgetAllocation> budgetAllocations() {
        List<BudgetAllocation> allocations = budgetAllocationRepository.findAll();

        Map<String, String> nameToId = new HashMap<>();
        departmentRepository.findAll().forEach(d -> nameToId.put(d.getName(), String.valueOf(d.getId())));

        Map<String, BigDecimal> consumedByDeptYear = new HashMap<>();
        for (var row : purchaseOrderRepository.findSpendRows()) {
            if (row.getCreatedAt() == null) continue;
            String deptId = nameToId.get(row.getDepartmentName());
            if (deptId == null) continue;
            int year = YearMonth.from(row.getCreatedAt()).getYear();
            String key = deptId + ":" + year;
            consumedByDeptYear.merge(key, row.getAmount() == null ? BigDecimal.ZERO : row.getAmount(), BigDecimal::add);
        }

        for (BudgetAllocation allocation : allocations) {
            String key = allocation.getDepartmentId() + ":" + allocation.getFiscalYear();
            allocation.setConsumedAmount(consumedByDeptYear.getOrDefault(key, BigDecimal.ZERO));
        }

        return allocations;
    }
}
