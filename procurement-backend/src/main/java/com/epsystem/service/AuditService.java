package com.epsystem.service;

import com.epsystem.entity.AuditLog;
import com.epsystem.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Module 5: every meaningful state change gets an audit_log row - not just
 * the requisition/PO status-history tables (which only track that entity's
 * own lifecycle), but a single cross-entity trail an auditor can query by
 * entity_name + entity_id regardless of which table it lives in.
 */
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(String entityName, Long entityId, String action, Long performedBy, String oldValue, String newValue) {
        auditLogRepository.save(AuditLog.builder()
                .entityName(entityName)
                .entityId(entityId)
                .action(action)
                .performedBy(performedBy)
                .performedAt(LocalDateTime.now())
                .oldValue(oldValue)
                .newValue(newValue)
                .build());
    }
}
