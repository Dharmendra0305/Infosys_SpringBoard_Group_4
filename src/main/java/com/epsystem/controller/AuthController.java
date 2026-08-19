package com.epsystem.controller;

import com.epsystem.dto.LoginRequest;
import com.epsystem.dto.LoginResponse;
import com.epsystem.entity.Employee;
import com.epsystem.entity.Role;
import com.epsystem.entity.UserRole;
import com.epsystem.repository.EmployeeRepository;
import com.epsystem.repository.RoleRepository;
import com.epsystem.repository.UserRoleRepository;
import com.epsystem.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final EmployeeRepository employeeRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Employee employee = employeeRepository.findByUsername(request.getUsername()).orElse(null);

        if (employee == null || employee.getPasswordHash() == null
                || !passwordEncoder.matches(request.getPassword(), employee.getPasswordHash())) {
            return ResponseEntity.status(401).body(new ErrorBody("Invalid username or password"));
        }

        List<String> roleNames = userRoleRepository.findAll().stream()
                .filter(ur -> ur.getEmployeeId().equals(employee.getId()))
                .map(UserRole::getRoleId)
                .map(roleId -> roleRepository.findById(roleId).map(Role::getName).orElse(null))
                .filter(name -> name != null)
                .toList();

        String token = jwtService.issueToken(employee.getId(), employee.getUsername(), roleNames);
        long expiresAt = System.currentTimeMillis() + jwtService.expirationMillis();

        return ResponseEntity.ok(new LoginResponse(
                token,
                expiresAt,
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getDesignation(),
                employee.getDepartmentId(),
                roleNames
        ));
    }

    private record ErrorBody(String message) {}
}
