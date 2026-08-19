-- ============================================================
-- V4: Sample spend_summary rows across 6 months x 4 departments
-- so the Statistics page has real month-by-month, department-by-
-- department numbers to chart (pie: this month; line: trend).
-- Uses the IT/Software category (2) and Hardware category (1) as
-- the dominant categories, mixed in with Office Supplies (3) and
-- Professional Services (4) for variety.
-- ============================================================

INSERT INTO spend_summary (department_id, category_id, fiscal_year, fiscal_month, total_spend, po_count) VALUES
-- IT (department_id = 1)
(1, 1, 2026, 2, 210000.00, 3),
(1, 2, 2026, 3, 165000.00, 2),
(1, 1, 2026, 4, 340000.00, 4),
(1, 2, 2026, 5, 128000.00, 2),
(1, 1, 2026, 6, 96000.00, 1),
-- July already has a row for category 2 from V2 (18000.00) - add hardware spend for July too
(1, 1, 2026, 7, 152000.00, 2),

-- Finance (department_id = 2)
(2, 4, 2026, 2, 84000.00, 1),
(2, 3, 2026, 3, 21000.00, 2),
(2, 4, 2026, 4, 118000.00, 2),
(2, 3, 2026, 5, 15500.00, 1),
(2, 4, 2026, 6, 63000.00, 1),
(2, 4, 2026, 7, 97500.00, 2),

-- HR (department_id = 3)
(3, 3, 2026, 2, 32000.00, 2),
(3, 4, 2026, 3, 54000.00, 1),
(3, 3, 2026, 4, 18000.00, 1),
(3, 4, 2026, 5, 71000.00, 2),
(3, 3, 2026, 6, 24500.00, 1),
(3, 3, 2026, 7, 41000.00, 2),

-- Operations (department_id = 4)
(4, 1, 2026, 2, 145000.00, 2),
(4, 3, 2026, 3, 38000.00, 1),
(4, 1, 2026, 4, 176000.00, 3),
(4, 4, 2026, 5, 92000.00, 1),
(4, 1, 2026, 6, 109000.00, 2),
(4, 1, 2026, 7, 134000.00, 2);
