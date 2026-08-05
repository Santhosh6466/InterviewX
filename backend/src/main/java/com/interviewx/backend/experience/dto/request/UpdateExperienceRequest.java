package com.interviewx.backend.experience.dto.request;

import com.interviewx.backend.experience.enums.Difficulty;
import com.interviewx.backend.experience.enums.ExperienceLevel;
import com.interviewx.backend.experience.enums.InterviewResult;
import com.interviewx.backend.experience.enums.InterviewType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateExperienceRequest {

    @NotBlank(message = "Company ID is required")
    private String companyId;

    @NotBlank(message = "Overall experience is required")
    private String overallExperience;

    @NotBlank(message = "Role is required")
    private String role;

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Interview type is required")
    private InterviewType interviewType;

    @NotNull(message = "Experience level is required")
    private ExperienceLevel experienceLevel;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Interview date is required")
    private LocalDate interviewDate;

    @NotNull(message = "Interview result is required")
    private InterviewResult result;

    @NotNull(message = "Difficulty is required")
    private Difficulty difficulty;
}
