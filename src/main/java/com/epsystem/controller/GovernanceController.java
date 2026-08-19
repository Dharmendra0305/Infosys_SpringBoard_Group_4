package com.epsystem.controller;

import com.epsystem.entity.*;
import com.epsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Module 5: Security, Integration & Governance.
 * Roles, role assignments, and the audit trail.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GovernanceController {

    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final AuditLogRepository auditLogRepository;
    private final EmployeeRepository employeeRepository;

    @GetMapping("/roles")
    public List<Role> roles() { return roleRepository.findAll(); }

    @GetMapping("/employees")
    public List<Employee> employees() { return employeeRepository.findAll(); }

    @GetMapping("/employees/{id}/roles")
    public List<Role> rolesForEmployee(@PathVariable Long id) {
        List<Long> roleIds = userRoleRepository.findAll().stream()
                .filter(ur -> ur.getEmployeeId().equals(id))
                .map(UserRole::getRoleId)
                .toList();
        return roleRepository.findAllById(roleIds);
    }

    // Full audit trail for one entity instance, e.g. /api/audit-log/purchase_requisitions/1
    @GetMapping("/audit-log/{entityName}/{entityId}")
    public List<AuditLog> auditTrail(@PathVariable String entityName, @PathVariable Long entityId) {
        return auditLogRepository.findAll().stream()
                .filter(a -> a.getEntityName().equals(entityName) && a.getEntityId().equals(entityId))
                .toList();
    }
}
