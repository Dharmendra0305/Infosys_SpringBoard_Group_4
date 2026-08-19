package com.epsystem.controller;

import com.epsystem.entity.*;
import com.epsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Simple CRUD endpoints for Module 1 master data:
 * departments, cost centers, categories, suppliers.
 */
@RestController
@RequiredArgsConstructor
public class MasterDataController {

    private final DepartmentRepository departmentRepository;
    private final CostCenterRepository costCenterRepository;
    private final ProcurementCategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final SupplierContactRepository supplierContactRepository;

    // ---- Departments ----
    @GetMapping("/api/departments")
    public List<Department> getDepartments() { return departmentRepository.findAll(); }

    @PostMapping("/api/departments")
    public Department createDepartment(@RequestBody Department department) {
        return departmentRepository.save(department);
    }

    // ---- Cost Centers ----
    @GetMapping("/api/cost-centers")
    public List<CostCenter> getCostCenters() { return costCenterRepository.findAll(); }

    @PostMapping("/api/cost-centers")
    public CostCenter createCostCenter(@RequestBody CostCenter costCenter) {
        return costCenterRepository.save(costCenter);
    }

    // ---- Procurement Categories ----
    @GetMapping("/api/categories")
    public List<ProcurementCategory> getCategories() { return categoryRepository.findAll(); }

    @PostMapping("/api/categories")
    public ProcurementCategory createCategory(@RequestBody ProcurementCategory category) {
        return categoryRepository.save(category);
    }

    // ---- Suppliers ----
    @GetMapping("/api/suppliers")
    public List<Supplier> getSuppliers() { return supplierRepository.findAll(); }

    @PostMapping("/api/suppliers")
    public Supplier createSupplier(@RequestBody Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    @GetMapping("/api/suppliers/{id}/contacts")
    public List<SupplierContact> getSupplierContacts(@PathVariable Long id) {
        return supplierContactRepository.findAll().stream()
                .filter(c -> c.getSupplierId().equals(id))
                .toList();
    }
}
