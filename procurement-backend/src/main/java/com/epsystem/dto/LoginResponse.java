package com.epsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private long expiresAt; // epoch millis
    private Long employeeId;
    private String employeeCode;
    private String firstName;
    private String lastName;
    private String designation;
    private Long departmentId;
    private List<String> roles;
}
