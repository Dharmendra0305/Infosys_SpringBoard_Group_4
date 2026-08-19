package com.epsystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "employees")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_code")
    private String employeeCode;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "email")
    private String email;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "manager_id")
    private Long managerId;

    @Column(name = "designation")
    private String designation;

    @Column(name = "username")
    private String username;

    @Column(name = "password_hash")
    @JsonIgnore
    private String passwordHash;

}
