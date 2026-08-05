package com.interviewx.backend.interviewround.dto.request;

import com.interviewx.backend.experience.enums.Difficulty;
import com.interviewx.backend.interviewround.enums.RoundType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateInterviewRoundRequest {

    @NotNull(message = "Round number is required")
    private Integer roundNumber;

    @NotNull(message = "Round type is required")
    private RoundType roundType;

    @NotBlank(message = "Round title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private Integer duration;

    @NotNull(message = "Difficulty is required")
    private Difficulty difficulty;
}
