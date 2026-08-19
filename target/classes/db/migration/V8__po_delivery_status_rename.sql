-- ============================================================
-- V8: Rename PO delivery statuses to match the requested flow:
--   Send -> Acknowledge -> Deliver (partial/complete) -> Receipt -> Close
--
--   FULFILLED            -> DELIVERED
--   PARTIALLY_FULFILLED  -> PARTIALLY_DELIVERED
--
-- "Delivered" reads as the natural language for "goods receipt confirmed
-- complete" that the flow diagram asks for; CREATED/SENT/ACKNOWLEDGED/
-- CLOSED/DISPUTED/CANCELLED are unchanged - they already matched.
--
-- Ordering matters here: the CHECK constraint has to come OFF before the
-- UPDATEs run (MySQL 8.0.16+ enforces CHECK constraints against every row
-- written, so writing 'PARTIALLY_DELIVERED' while the constraint only
-- knows the old vocabulary fails immediately) and only goes back ON with
-- the new vocabulary once the data underneath it already matches.
-- ============================================================

-- Constraint off first - po_status_history.old_status/new_status are plain
-- VARCHAR (no constraint on that table), only purchase_orders.status is checked.
ALTER TABLE purchase_orders DROP CHECK chk_po_status;

UPDATE purchase_orders SET status = 'DELIVERED' WHERE status = 'FULFILLED';
UPDATE purchase_orders SET status = 'PARTIALLY_DELIVERED' WHERE status = 'PARTIALLY_FULFILLED';

UPDATE po_status_history SET old_status = 'DELIVERED' WHERE old_status = 'FULFILLED';
UPDATE po_status_history SET new_status = 'DELIVERED' WHERE new_status = 'FULFILLED';
UPDATE po_status_history SET old_status = 'PARTIALLY_DELIVERED' WHERE old_status = 'PARTIALLY_FULFILLED';
UPDATE po_status_history SET new_status = 'PARTIALLY_DELIVERED' WHERE new_status = 'PARTIALLY_FULFILLED';

-- Constraint back on, now that every row already speaks the new vocabulary
ALTER TABLE purchase_orders ADD CONSTRAINT chk_po_status
    CHECK (status IN ('CREATED','SENT','ACKNOWLEDGED','PARTIALLY_DELIVERED','DELIVERED','CLOSED','DISPUTED','CANCELLED'));
