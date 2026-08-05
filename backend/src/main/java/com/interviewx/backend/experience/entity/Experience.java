package com.interviewx.backend.experience.entity;

import com.interviewx.backend.experience.enums.Difficulty;
import com.interviewx.backend.experience.enums.ExperienceLevel;
import com.interviewx.backend.experience.enums.InterviewResult;
import com.interviewx.backend.experience.enums.InterviewType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "experiences")
public class Experience {

    @Id
    private String id;

    private String title;

    private String overallExperience;

    private String userId;

    private String companyId;

    private String role;

    private InterviewType interviewType;

    private ExperienceLevel experienceLevel;

    private String location;

    private LocalDate interviewDate;

    private InterviewResult result;

    private Difficulty difficulty;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
