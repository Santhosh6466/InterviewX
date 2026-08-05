package com.interviewx.backend.company.repository;

import com.interviewx.backend.company.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends MongoRepository<Company, String> {

    Optional<Company> findByName(String name);

    boolean existsByName(String name);

    Page<Company> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
