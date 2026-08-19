package com.epsystem.controller;

import com.epsystem.dto.StatisticsResponse;
import com.epsystem.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    // GET /api/statistics or GET /api/statistics?year=2026&month=8
    // Omit both params for the current month.
    @GetMapping("/api/statistics")
    public StatisticsResponse getStatistics(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        return statisticsService.getStatistics(year, month);
    }
}
