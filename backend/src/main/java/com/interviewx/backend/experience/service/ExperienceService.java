package com.interviewx.backend.experience.service;

import com.interviewx.backend.company.dto.response.CompanyResponse;
import com.interviewx.backend.company.repository.CompanyRepository;
import com.interviewx.backend.company.entity.Company;
import com.interviewx.backend.experience.entity.Experience;
import com.interviewx.backend.experience.enums.Difficulty;
import com.interviewx.backend.experience.enums.ExperienceLevel;
import com.interviewx.backend.experience.enums.InterviewResult;
import com.interviewx.backend.experience.enums.InterviewType;
import com.interviewx.backend.experience.repository.ExperienceRepositoryCustom;
import com.interviewx.backend.interviewround.entity.InterviewRound;
import com.interviewx.backend.auth.entity.User;
import com.interviewx.backend.common.exception.ResourceNotFoundException;
import com.interviewx.backend.experience.dto.request.CreateExperienceRequest;
import com.interviewx.backend.experience.dto.request.UpdateExperienceRequest;
import com.interviewx.backend.experience.dto.response.ExperienceResponse;
import com.interviewx.backend.experience.repository.ExperienceRepository;
import com.interviewx.backend.interviewround.dto.response.InterviewRoundResponse;
import com.interviewx.backend.interviewround.repository.InterviewRoundRepository;
import com.interviewx.backend.like.repository.LikeRepository;
import com.interviewx.backend.auth.repository.UserRepository;
import com.interviewx.backend.common.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
@RequiredArgsConstructor
public class ExperienceService {

    private final LikeRepository likeRepository;
    private final ExperienceRepository experienceRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final InterviewRoundRepository interviewRoundRepository;
    private final ExperienceRepositoryCustom experienceRepositoryCustom;

    public ExperienceResponse createExperience(CreateExperienceRequest request) {

        String email = SecurityUtils.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        Experience experience = Experience.builder()
                .title(request.getTitle())
                .overallExperience(request.getOverallExperience())
                .userId(user.getId())
                .companyId(company.getId())
                .role(request.getRole())
                .interviewType(request.getInterviewType())
                .experienceLevel(request.getExperienceLevel())
                .location(request.getLocation())
                .interviewDate(request.getInterviewDate())
                .result(request.getResult())
                .difficulty(request.getDifficulty())
                .build();

        Experience savedExperience = experienceRepository.save(experience);

        return mapToResponse(savedExperience, getCurrentUserId());
    }

    public ExperienceResponse getExperienceById(String experienceId) {

        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new ResourceNotFoundException("Experience not found"));

        return mapToResponse(experience, getCurrentUserId());
    }

    public Page<ExperienceResponse> getAllExperiences(int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Experience> experiences = experienceRepository.findAll(pageable);

        String currentUserId = getCurrentUserId();

        return experiences.map(exp -> mapToResponse(exp, currentUserId));
    }

    public ExperienceResponse updateExperience(String experienceId,
                                               UpdateExperienceRequest request) {

        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Experience not found"));

        validateExperienceOwner(experience);

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Company not found"));

        experience.setTitle(request.getTitle());
        experience.setOverallExperience(request.getOverallExperience());
        experience.setCompanyId(company.getId());
        experience.setRole(request.getRole());
        experience.setInterviewType(request.getInterviewType());
        experience.setExperienceLevel(request.getExperienceLevel());
        experience.setLocation(request.getLocation());
        experience.setInterviewDate(request.getInterviewDate());
        experience.setResult(request.getResult());
        experience.setDifficulty(request.getDifficulty());

        Experience updatedExperience = experienceRepository.save(experience);

        return mapToResponse(updatedExperience, getCurrentUserId());
    }

    public void deleteExperience(String experienceId) {

        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Experience not found"));

        validateExperienceOwner(experience);

        interviewRoundRepository.deleteByExperienceId(experienceId);

        experienceRepository.delete(experience);
    }

    private ExperienceResponse mapToResponse(
            Experience experience,
            String currentUserId
    ) {

        Company company = companyRepository.findById(experience.getCompanyId())
                .orElse(null);

        ExperienceResponse response = new ExperienceResponse();
        CompanyResponse companyResponse = new CompanyResponse();

        response.setId(experience.getId());
        response.setTitle(experience.getTitle());
        response.setOverallExperience(experience.getOverallExperience());

        if (company != null) {
            companyResponse.setId(company.getId());
            companyResponse.setName(company.getName());
            companyResponse.setLogoUrl(company.getLogoUrl());
            companyResponse.setRating(company.getRating());
        }

        response.setCompany(companyResponse);

        List<InterviewRound> rounds =
                interviewRoundRepository.findByExperienceIdOrderByRoundNumberAsc(experience.getId());

        List<InterviewRoundResponse> roundResponses = rounds.stream()
                .map(this::mapRoundToResponse)
                .toList();

        response.setInterviewRounds(roundResponses);

        response.setRole(experience.getRole());
        response.setInterviewType(experience.getInterviewType());
        response.setExperienceLevel(experience.getExperienceLevel());
        response.setLocation(experience.getLocation());
        response.setInterviewDate(experience.getInterviewDate());
        response.setResult(experience.getResult());
        response.setDifficulty(experience.getDifficulty());

        response.setCreatedAt(experience.getCreatedAt());
        response.setUpdatedAt(experience.getUpdatedAt());
        response.setAuthorId(experience.getUserId());

        userRepository.findById(experience.getUserId()).ifPresent(author -> {
            response.setAuthorName(author.getName());
            response.setAuthorProfilePicture(author.getProfilePicture());
            String seed = author.getAvatarSeed() != null ? author.getAvatarSeed() : "default-avatar";
            response.setAuthorAvatarSeed(seed);
            response.setAvatarSeed(seed);
        });

        response.setLikesCount(
                likeRepository.countByExperienceId(experience.getId())
        );

        response.setLiked(
                currentUserId != null &&
                        likeRepository.existsByExperienceIdAndUserId(
                                experience.getId(),
                                currentUserId
                        )
        );

        return response;
    }

    public List<ExperienceResponse> getMyExperiences() {
        User currentUser = getCurrentUser();
        List<Experience> experiences = experienceRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        return experiences.stream().map(exp -> mapToResponse(exp, currentUser.getId())).toList();
    }

    public Page<ExperienceResponse> getExperiencesByCompany(String companyId,
                                                            int page,
                                                            int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Experience> experiences =
                experienceRepository.findByCompanyId(companyId, pageable);

        String currentUserId = getCurrentUserId();

        return experiences.map(exp -> mapToResponse(exp, currentUserId));
    }

    public Page<ExperienceResponse> searchExperiences(
            String search,
            String companyId,
            ExperienceLevel level,
            InterviewType type,
            InterviewResult result,
            Difficulty difficulty,
            Pageable pageable
    ) {

        Page<Experience> experiences = experienceRepositoryCustom.search(
                search,
                companyId,
                level,
                type,
                result,
                difficulty,
                pageable
        );

        String currentUserId = getCurrentUserId();

        return experiences.map(exp -> mapToResponse(exp, currentUserId));
    }

    private InterviewRoundResponse mapRoundToResponse(InterviewRound round) {

        InterviewRoundResponse response = new InterviewRoundResponse();

        response.setId(round.getId());
        response.setExperienceId(round.getExperienceId());
        response.setRoundNumber(round.getRoundNumber());
        response.setRoundType(round.getRoundType());
        response.setTitle(round.getTitle());
        response.setDescription(round.getDescription());
        response.setDuration(round.getDuration());
        response.setDifficulty(round.getDifficulty());
        response.setCreatedAt(round.getCreatedAt());
        response.setUpdatedAt(round.getUpdatedAt());

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

    private String getCurrentUserId() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return null;
            }
            String email = auth.getName();
            return userRepository.findByEmail(email).map(User::getId).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }
}
