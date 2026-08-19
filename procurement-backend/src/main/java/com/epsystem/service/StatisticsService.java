package com.epsystem.service;

import com.epsystem.dto.StatisticsResponse;
import com.epsystem.dto.StatisticsResponse.DepartmentBreakdown;
import com.epsystem.dto.StatisticsResponse.DepartmentSeries;
import com.epsystem.dto.StatisticsResponse.MonthlyTrend;
import com.epsystem.repository.PurchaseOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Module 4: Procurement Analytics.
 *
 * Deliberately reads straight from purchase_orders (via a lean projection
 * joined through the requisition to reach the department) rather than the
 * spend_summary table - spend_summary is a separately-maintained reporting
 * snapshot with only seeded demo rows, so it goes stale the moment someone
 * raises a real requisition. This endpoint is always live.
 */
@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final PurchaseOrderRepository purchaseOrderRepository;

    private static final int TREND_MONTHS = 6;

    public StatisticsResponse getStatistics(Integer year, Integer month) {
        YearMonth target = (year != null && month != null)
                ? YearMonth.of(year, month)
                : YearMonth.now();

        List<PurchaseOrderRepository.SpendRow> rows = purchaseOrderRepository.findSpendRows();

        // ---- current month: department breakdown + total ----
        Map<String, BigDecimal> spendByDeptThisMonth = new LinkedHashMap<>();
        for (var row : rows) {
            if (row.getCreatedAt() == null) continue;
            YearMonth rowMonth = YearMonth.from(row.getCreatedAt());
            if (!rowMonth.equals(target)) continue;

            spendByDeptThisMonth.merge(row.getDepartmentName(),
                    row.getAmount() == null ? BigDecimal.ZERO : row.getAmount(), BigDecimal::add);
        }

        BigDecimal totalSpend = spendByDeptThisMonth.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<DepartmentBreakdown> breakdown = spendByDeptThisMonth.entrySet().stream()
                .map(e -> new DepartmentBreakdown(
                        e.getKey(),
                        e.getValue(),
                        sharePercent(e.getValue(), totalSpend)))
                .sorted((a, b) -> b.spend().compareTo(a.spend()))
                .toList();

        // ---- trailing N-month trend, one line per department that had any spend in the window ----
        List<YearMonth> window = new ArrayList<>();
        for (int i = TREND_MONTHS - 1; i >= 0; i--) {
            window.add(target.minusMonths(i));
        }

        Map<String, Map<YearMonth, BigDecimal>> byDeptByMonth = new LinkedHashMap<>();
        for (var row : rows) {
            if (row.getCreatedAt() == null) continue;
            YearMonth rowMonth = YearMonth.from(row.getCreatedAt());
            if (!window.contains(rowMonth)) continue;

            byDeptByMonth
                    .computeIfAbsent(row.getDepartmentName(), k -> new HashMap<>())
                    .merge(rowMonth, row.getAmount() == null ? BigDecimal.ZERO : row.getAmount(), BigDecimal::add);
        }

        List<String> monthLabels = window.stream().map(StatisticsService::label).toList();

        List<DepartmentSeries> series = byDeptByMonth.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new DepartmentSeries(
                        e.getKey(),
                        window.stream().map(m -> e.getValue().getOrDefault(m, BigDecimal.ZERO)).toList()))
                .toList();

        return new StatisticsResponse(
                label(target),
                totalSpend,
                spendByDeptThisMonth.size(),
                breakdown,
                new MonthlyTrend(monthLabels, series)
        );
    }

    private static double sharePercent(BigDecimal deptSpend, BigDecimal total) {
        if (total == null || total.signum() == 0) return 0.0;
        return deptSpend.divide(total, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private static String label(YearMonth ym) {
        String monthName = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
        return monthName + " " + ym.getYear();
    }
}
