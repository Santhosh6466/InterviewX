package com.interviewx.backend.experience.dto.response;

import com.interviewx.backend.company.dto.response.CompanyResponse;
import com.interviewx.backend.experience.enums.Difficulty;
import com.interviewx.backend.experience.enums.ExperienceLevel;
import com.interviewx.backend.experience.enums.InterviewResult;
import com.interviewx.backend.experience.enums.InterviewType;
import com.interviewx.backend.interviewround.dto.response.InterviewRoundResponse;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ExperienceResponse {

    private String authorId;

    private long likesCount;

    private boolean liked;

    private List<InterviewRoundResponse> interviewRounds;

    private String id;

    private String title;

    private String overallExperience;

    private CompanyResponse company;

    private String role;

    private InterviewType interviewType;

    private ExperienceLevel experienceLevel;

    private String location;

    private LocalDate interviewDate;

    private InterviewResult result;

    private Difficulty difficulty;

    private String authorName;

    private String authorProfilePicture;

    private String authorAvatarSeed;

    private String avatarSeed;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
