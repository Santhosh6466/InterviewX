package com.interviewx.backend.auth.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "verified_emails")
public class VerifiedEmail {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private LocalDateTime verifiedAt;

    private LocalDateTime expiryTime;
}
