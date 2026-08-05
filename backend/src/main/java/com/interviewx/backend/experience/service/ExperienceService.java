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
import com.interviewx.backend.like.entity.Like;
import com.interviewx.backend.like.repository.LikeRepository;
import com.interviewx.backend.auth.repository.UserRepository;
import com.interviewx.backend.common.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

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
        List<ExperienceResponse> responses = mapToResponses(experiences.getContent(), currentUserId);

        return new PageImpl<>(responses, pageable, experiences.getTotalElements());
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

    public List<ExperienceResponse> getMyExperiences() {
        User currentUser = getCurrentUser();
        List<Experience> experiences = experienceRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        return mapToResponses(experiences, currentUser.getId());
    }

    public Page<ExperienceResponse> getExperiencesByCompany(String companyId,
                                                            int page,
                                                            int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Experience> experiences =
                experienceRepository.findByCompanyId(companyId, pageable);

        String currentUserId = getCurrentUserId();
        List<ExperienceResponse> responses = mapToResponses(experiences.getContent(), currentUserId);

        return new PageImpl<>(responses, pageable, experiences.getTotalElements());
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
        List<ExperienceResponse> responses = mapToResponses(experiences.getContent(), currentUserId);

        return new PageImpl<>(responses, pageable, experiences.getTotalElements());
    }

    public ExperienceResponse mapToResponse(Experience experience, String currentUserId) {
        if (experience == null) {
            return null;
        }
        List<ExperienceResponse> responses = mapToResponses(Collections.singletonList(experience), currentUserId);
        return responses.isEmpty() ? null : responses.get(0);
    }

    public List<ExperienceResponse> mapToResponses(List<Experience> experiences, String currentUserId) {
        if (experiences == null || experiences.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> expIds = experiences.stream()
                .map(Experience::getId)
                .filter(Objects::nonNull)
                .toList();

        List<String> companyIds = experiences.stream()
                .map(Experience::getCompanyId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        List<String> userIds = experiences.stream()
                .map(Experience::getUserId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        // 1. Batch fetch companies
        Map<String, Company> companyMap = companyIds.isEmpty() ? Collections.emptyMap()
                : companyRepository.findAllById(companyIds).stream()
                        .collect(Collectors.toMap(Company::getId, c -> c, (a, b) -> a));

        // 2. Batch fetch author users
        Map<String, User> userMap = userIds.isEmpty() ? Collections.emptyMap()
                : userRepository.findAllById(userIds).stream()
                        .collect(Collectors.toMap(User::getId, u -> u, (a, b) -> a));

        // 3. Batch fetch interview rounds
        List<InterviewRound> allRounds = expIds.isEmpty() ? Collections.emptyList()
                : interviewRoundRepository.findByExperienceIdInOrderByRoundNumberAsc(expIds);
        Map<String, List<InterviewRound>> roundsMap = allRounds.stream()
                .collect(Collectors.groupingBy(InterviewRound::getExperienceId));

        // 4. Batch fetch like counts
        List<Like> allLikes = expIds.isEmpty() ? Collections.emptyList()
                : likeRepository.findByExperienceIdIn(expIds);
        Map<String, Long> likesCountMap = allLikes.stream()
                .collect(Collectors.groupingBy(Like::getExperienceId, Collectors.counting()));

        // 5. Batch fetch current user liked status
        Set<String> userLikedExpIds = (currentUserId == null || expIds.isEmpty()) ? Collections.emptySet()
                : likeRepository.findByExperienceIdInAndUserId(expIds, currentUserId).stream()
                        .map(Like::getExperienceId)
                        .collect(Collectors.toSet());

        return experiences.stream().map(exp -> {
            Company company = exp.getCompanyId() != null ? companyMap.get(exp.getCompanyId()) : null;
            CompanyResponse companyResponse = new CompanyResponse();
            if (company != null) {
                companyResponse.setId(company.getId());
                companyResponse.setName(company.getName());
                companyResponse.setLogoUrl(company.getLogoUrl());
                companyResponse.setRating(company.getRating());
            }

            List<InterviewRound> rounds = roundsMap.getOrDefault(exp.getId(), Collections.emptyList());
            List<InterviewRoundResponse> roundResponses = rounds.stream()
                    .map(this::mapRoundToResponse)
                    .toList();

            User author = exp.getUserId() != null ? userMap.get(exp.getUserId()) : null;

            ExperienceResponse response = new ExperienceResponse();
            response.setId(exp.getId());
            response.setTitle(exp.getTitle());
            response.setOverallExperience(exp.getOverallExperience());
            response.setCompany(companyResponse);
            response.setInterviewRounds(roundResponses);
            response.setRole(exp.getRole());
            response.setInterviewType(exp.getInterviewType());
            response.setExperienceLevel(exp.getExperienceLevel());
            response.setLocation(exp.getLocation());
            response.setInterviewDate(exp.getInterviewDate());
            response.setResult(exp.getResult());
            response.setDifficulty(exp.getDifficulty());
            response.setCreatedAt(exp.getCreatedAt());
            response.setUpdatedAt(exp.getUpdatedAt());
            response.setAuthorId(exp.getUserId());

            if (author != null) {
                response.setAuthorName(author.getName());
                response.setAuthorProfilePicture(author.getProfilePicture());
                String seed = author.getAvatarSeed() != null ? author.getAvatarSeed() : "default-avatar";
                response.setAuthorAvatarSeed(seed);
                response.setAvatarSeed(seed);
            }

            response.setLikesCount(likesCountMap.getOrDefault(exp.getId(), 0L));
            response.setLiked(userLikedExpIds.contains(exp.getId()));

            return response;
        }).toList();
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
