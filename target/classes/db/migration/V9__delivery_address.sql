-- ============================================================
-- V9: Delivery address - where the goods should actually be sent.
-- Captured on the requisition (the employee knows where they need it)
-- and copied onto the PO at conversion time (the supplier needs it on
-- the order itself, not buried three clicks away on the source requisition).
-- ============================================================

ALTER TABLE purchase_requisitions ADD COLUMN delivery_address VARCHAR(500) AFTER justification;
ALTER TABLE purchase_orders ADD COLUMN delivery_address VARCHAR(500) AFTER expected_delivery_date;
