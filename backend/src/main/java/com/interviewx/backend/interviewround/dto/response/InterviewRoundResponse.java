package com.interviewx.backend.interviewround.dto.response;

import com.interviewx.backend.experience.enums.Difficulty;
import com.interviewx.backend.interviewround.enums.RoundType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InterviewRoundResponse {

    private String id;

    private String experienceId;

    private Integer roundNumber;

    private RoundType roundType;

    private String title;

    private String description;

    private Integer duration;

    private Difficulty difficulty;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
