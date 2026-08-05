package com.interviewx.backend.profile.dto.response;

import com.interviewx.backend.company.dto.response.CompanyResponse;
import com.interviewx.backend.profile.enums.CareerStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProfileResponse {

    private String id;

    private String name;

    private String email;

    private String profilePicture;

    private String avatarSeed;

    private Boolean profileCompleted;

    private String headline;

    private String bio;

    private String college;

    private String branch;

    private Integer graduationYear;

    private CareerStatus careerStatus;

    private CompanyResponse currentCompany;

    private String currentRole;

    private String linkedinUrl;

    private String githubUrl;

    private String leetcodeUrl;

    private String portfolioUrl;

    private Integer experienceCount;

    private Integer totalLikes;

    private LocalDateTime createdAt;
}
