package com.interviewx.backend.like.service;

import com.interviewx.backend.like.dto.response.LikeResponse;
import com.interviewx.backend.like.entity.Like;
import com.interviewx.backend.like.repository.LikeRepository;
import com.interviewx.backend.experience.entity.Experience;
import com.interviewx.backend.experience.repository.ExperienceRepository;
import com.interviewx.backend.common.exception.BadRequestException;
import com.interviewx.backend.common.exception.ResourceNotFoundException;
import com.interviewx.backend.auth.repository.UserRepository;
import com.interviewx.backend.auth.entity.User;
import com.interviewx.backend.notification.entity.Notification;
import com.interviewx.backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final ExperienceRepository experienceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public LikeResponse likeExperience(String experienceId) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new ResourceNotFoundException("Experience not found"));

        if (experience.getUserId().equals(user.getId())) {
            throw new BadRequestException("You cannot like your own experience.");
        }

        if (likeRepository.existsByExperienceIdAndUserId(experienceId, user.getId())) {
            return LikeResponse.builder()
                    .liked(true)
                    .likesCount(likeRepository.countByExperienceId(experienceId))
                    .build();
        }

        Like like = Like.builder()
                .experienceId(experienceId)
                .userId(user.getId())
                .createdAt(LocalDateTime.now())
                .build();

        likeRepository.save(like);

        if (!experience.getUserId().equals(user.getId())) {

            notificationService.createLikeNotification(
                    experience.getUserId(),
                    user.getId(),
                    experience.getId(),
                    user.getName()
            );
        }

        return LikeResponse.builder()
                .liked(true)
                .likesCount(likeRepository.countByExperienceId(experienceId))
                .build();
    }

    public LikeResponse unlikeExperience(String experienceId) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        likeRepository.deleteByExperienceIdAndUserId(experienceId, user.getId());

        return LikeResponse.builder()
                .liked(false)
                .likesCount(likeRepository.countByExperienceId(experienceId))
                .build();
    }

    public boolean hasLiked(String experienceId) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return likeRepository.existsByExperienceIdAndUserId(
                experienceId,
                user.getId()
        );
    }
}
