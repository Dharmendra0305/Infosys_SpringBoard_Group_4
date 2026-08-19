package com.epsystem.dto;

import java.math.BigDecimal;
import java.util.List;

public class StatisticsResponse {

    public record DepartmentBreakdown(String department, BigDecimal spend, double share) {}

    public record DepartmentSeries(String name, List<BigDecimal> values) {}

    public record MonthlyTrend(List<String> months, List<DepartmentSeries> departments) {}

    private String period;
    private BigDecimal totalSpend;
    private int departmentsSpending;
    private List<DepartmentBreakdown> departmentBreakdown;
    private MonthlyTrend monthlyTrend;

    public StatisticsResponse(String period, BigDecimal totalSpend, int departmentsSpending,
                               List<DepartmentBreakdown> departmentBreakdown, MonthlyTrend monthlyTrend) {
        this.period = period;
        this.totalSpend = totalSpend;
        this.departmentsSpending = departmentsSpending;
        this.departmentBreakdown = departmentBreakdown;
        this.monthlyTrend = monthlyTrend;
    }

    public String getPeriod() { return period; }
    public BigDecimal getTotalSpend() { return totalSpend; }
    public int getDepartmentsSpending() { return departmentsSpending; }
    public List<DepartmentBreakdown> getDepartmentBreakdown() { return departmentBreakdown; }
    public MonthlyTrend getMonthlyTrend() { return monthlyTrend; }
}
