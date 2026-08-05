package com.interviewx.backend.interviewround.entity;

import com.interviewx.backend.experience.enums.Difficulty;
import com.interviewx.backend.interviewround.enums.RoundType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "interview_rounds")
public class InterviewRound {

    @Id
    private String id;

    @NotBlank(message = "Experience ID is required")
    private String experienceId;

    private Integer roundNumber;

    private RoundType roundType;

    @NotBlank(message = "Round title is required")
    private String title;

    @NotBlank(message = "Round description is required")
    private String description;

    private Integer duration;

    private Difficulty difficulty;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
