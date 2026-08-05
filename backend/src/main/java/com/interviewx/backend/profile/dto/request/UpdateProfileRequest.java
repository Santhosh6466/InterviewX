package com.interviewx.backend.profile.dto.request;

import com.interviewx.backend.profile.enums.CareerStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String headline;

    private String bio;

    private String college;

    private String branch;

    private Integer graduationYear;

    private CareerStatus careerStatus;

    private String currentCompanyId;

    private String currentRole;

    private String linkedinUrl;

    private String githubUrl;

    private String leetcodeUrl;

    private String portfolioUrl;

    private String avatarSeed;
}
