package com.epsystem.controller;

import com.epsystem.entity.*;
import com.epsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Module 4: Procurement Analytics & Reporting.
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportingController {

    private final SpendSummaryRepository spendSummaryRepository;
    private final BudgetAllocationRepository budgetAllocationRepository;

    @GetMapping("/spend-summary")
    public List<SpendSummary> spendSummary() {
        return spendSummaryRepository.findAll();
    }

    @GetMapping("/budget-allocations")
    public List<BudgetAllocation> budgetAllocations() {
        return budgetAllocationRepository.findAll();
    }
}
