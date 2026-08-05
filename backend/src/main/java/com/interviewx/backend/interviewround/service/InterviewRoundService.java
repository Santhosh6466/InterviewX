package com.interviewx.backend.interviewround.service;

import com.interviewx.backend.experience.entity.Experience;
import com.interviewx.backend.interviewround.entity.InterviewRound;
import com.interviewx.backend.auth.entity.User;
import com.interviewx.backend.common.exception.ResourceNotFoundException;
import com.interviewx.backend.experience.repository.ExperienceRepository;
import com.interviewx.backend.interviewround.dto.request.CreateInterviewRoundRequest;
import com.interviewx.backend.interviewround.dto.request.UpdateInterviewRoundRequest;
import com.interviewx.backend.interviewround.dto.response.InterviewRoundResponse;
import com.interviewx.backend.interviewround.repository.InterviewRoundRepository;
import com.interviewx.backend.auth.repository.UserRepository;
import com.interviewx.backend.common.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewRoundService {

    private final UserRepository userRepository;
    private final InterviewRoundRepository interviewRoundRepository;
    private final ExperienceRepository experienceRepository;

    public InterviewRoundResponse createInterviewRound(CreateInterviewRoundRequest request) {

        Experience experience = experienceRepository.findById(request.getExperienceId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Experience not found"));

        validateExperienceOwner(experience);

        InterviewRound interviewRound = InterviewRound.builder()
                .experienceId(experience.getId())
                .roundNumber(request.getRoundNumber())
                .roundType(request.getRoundType())
                .title(request.getTitle())
                .description(request.getDescription())
                .duration(request.getDuration())
                .difficulty(request.getDifficulty())
                .build();

        InterviewRound savedRound = interviewRoundRepository.save(interviewRound);

        return mapToResponse(savedRound);
    }

    public List<InterviewRoundResponse> getRoundsByExperience(String experienceId) {

        experienceRepository.findById(experienceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Experience not found"));

        List<InterviewRound> rounds =
                interviewRoundRepository.findByExperienceIdOrderByRoundNumberAsc(experienceId);

        return rounds.stream()
                .map(this::mapToResponse)
                .toList();
    }

    public InterviewRoundResponse updateInterviewRound(String roundId,
                                                       UpdateInterviewRoundRequest request) {

        InterviewRound interviewRound = interviewRoundRepository.findById(roundId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Interview round not found"));

        Experience experience = experienceRepository.findById(interviewRound.getExperienceId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Experience not found"));

        validateExperienceOwner(experience);

        interviewRound.setRoundNumber(request.getRoundNumber());
        interviewRound.setRoundType(request.getRoundType());
        interviewRound.setTitle(request.getTitle());
        interviewRound.setDescription(request.getDescription());
        interviewRound.setDuration(request.getDuration());
        interviewRound.setDifficulty(request.getDifficulty());

        InterviewRound updatedRound = interviewRoundRepository.save(interviewRound);

        return mapToResponse(updatedRound);
    }

    public void deleteInterviewRound(String roundId) {

        InterviewRound interviewRound = interviewRoundRepository.findById(roundId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Interview round not found"));

        Experience experience = experienceRepository.findById(interviewRound.getExperienceId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Experience not found"));

        validateExperienceOwner(experience);

        interviewRoundRepository.delete(interviewRound);
    }

    private InterviewRoundResponse mapToResponse(InterviewRound interviewRound) {

        InterviewRoundResponse response = new InterviewRoundResponse();

        response.setId(interviewRound.getId());
        response.setExperienceId(interviewRound.getExperienceId());
        response.setRoundNumber(interviewRound.getRoundNumber());
        response.setRoundType(interviewRound.getRoundType());
        response.setTitle(interviewRound.getTitle());
        response.setDescription(interviewRound.getDescription());
        response.setDuration(interviewRound.getDuration());
        response.setDifficulty(interviewRound.getDifficulty());
        response.setCreatedAt(interviewRound.getCreatedAt());
        response.setUpdatedAt(interviewRound.getUpdatedAt());

        return response;
    }

    private User getCurrentUser() {

        String email = SecurityUtils.getCurrentUserEmail();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
    }

    private void validateExperienceOwner(Experience experience) {

        User currentUser = getCurrentUser();

        if (!experience.getUserId().equals(currentUser.getId())) {
            throw new AccessDeniedException(
                    "You are not authorized to perform this action.");
        }
    }
}
