package com.interviewx.backend.experience.repository;


import com.interviewx.backend.experience.entity.Experience;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ExperienceRepository extends MongoRepository<Experience, String> {
    Page<Experience> findByCompanyId(String companyId, Pageable pageable);
    List<Experience> findByUserIdOrderByCreatedAtDesc(String userId);
}
