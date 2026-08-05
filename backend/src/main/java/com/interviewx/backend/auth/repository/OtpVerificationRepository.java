package com.interviewx.backend.auth.repository;

import com.interviewx.backend.auth.entity.OtpVerification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface OtpVerificationRepository extends MongoRepository<OtpVerification, String> {

    Optional<OtpVerification> findByEmail(String email);

    boolean existsByEmail(String email);

    void deleteByEmail(String email);

}
