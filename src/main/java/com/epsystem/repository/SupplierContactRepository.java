package com.epsystem.repository;

import com.epsystem.entity.SupplierContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierContactRepository extends JpaRepository<SupplierContact, Long> {
}
