package com.interviewx.backend.auth.repository;

import com.interviewx.backend.auth.entity.User;
import com.interviewx.backend.auth.entity.VerifiedEmail;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface VerifiedEmailRepository extends MongoRepository<VerifiedEmail, String> {

    boolean existsByEmail(String email);

    void deleteByEmail(String email);

    Optional<VerifiedEmail>findByEmail(String email);
}
