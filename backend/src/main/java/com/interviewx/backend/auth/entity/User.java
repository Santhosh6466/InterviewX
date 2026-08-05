package com.interviewx.backend.auth.entity;

import com.interviewx.backend.auth.enums.AuthProvider;
import com.interviewx.backend.profile.enums.CareerStatus;
import com.interviewx.backend.auth.enums.Role;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;

    private Role role;

    private String avatarSeed;

    private String profileImage;

    private boolean verified;

    private LocalDateTime createdAt;

    private AuthProvider authProvider;

    private String headline;

    private String bio;

    private String profilePicture;

    private String college;

    private String branch;

    private String likes;

    private Integer graduationYear;

    private CareerStatus careerStatus;

    private String currentCompanyId;

    private String currentRole;

    private String linkedinUrl;

    private String githubUrl;

    private String leetcodeUrl;

    private String portfolioUrl;

    private Boolean profileCompleted = false;

}
