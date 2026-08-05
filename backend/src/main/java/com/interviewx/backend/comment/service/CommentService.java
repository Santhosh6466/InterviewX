package com.interviewx.backend.comment.service;

import com.interviewx.backend.auth.entity.User;
import com.interviewx.backend.auth.repository.UserRepository;
import com.interviewx.backend.comment.dto.request.CreateCommentRequest;
import com.interviewx.backend.comment.dto.request.CreateReplyRequest;
import com.interviewx.backend.comment.dto.request.UpdateCommentRequest;
import com.interviewx.backend.comment.dto.response.CommentResponse;
import com.interviewx.backend.comment.entity.Comment;
import com.interviewx.backend.comment.repository.CommentRepository;
import com.interviewx.backend.common.exception.ResourceNotFoundException;
import com.interviewx.backend.experience.entity.Experience;
import com.interviewx.backend.experience.repository.ExperienceRepository;
import com.interviewx.backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final ExperienceRepository experienceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // Create a comment
    public CommentResponse createComment(String experienceId,
                                         CreateCommentRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new ResourceNotFoundException("Experience not found"));

        Comment comment = Comment.builder()
                .experienceId(experience.getId())
                .userId(user.getId())
                .content(request.getContent())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        commentRepository.save(comment);


        commentRepository.save(comment);

        if (!experience.getUserId().equals(user.getId())) {

            notificationService.createCommentNotification(
                    experience.getUserId(),
                    user.getId(),
                    experience.getId(),
                    user.getName()
            );
        }

        return mapToResponse(comment);


    }

    // Get all comments for an experience
    public List<CommentResponse> getCommentsByExperience(String experienceId) {

        experienceRepository.findById(experienceId)
                .orElseThrow(() -> new ResourceNotFoundException("Experience not found"));

        List<Comment> rootComments =
                commentRepository.findByExperienceIdAndParentCommentIdIsNullOrderByCreatedAtDesc(experienceId);

        return rootComments.stream().map(comment -> {

            // Convert root comment
            CommentResponse response = mapToResponse(comment);

            // Fetch replies
            List<CommentResponse> replies = commentRepository
                    .findByParentCommentIdOrderByCreatedAtAsc(comment.getId())
                    .stream()
                    .map(this::mapToResponse)
                    .toList();

            // Attach replies
            response.setReplies(replies);
            response.setReplyCount(replies.size());

            return response;

        }).toList();
    }

    // Update a comment
    public CommentResponse updateComment(String commentId,
                                         UpdateCommentRequest request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only edit your own comment.");
        }

        comment.setContent(request.getContent());
        comment.setUpdatedAt(LocalDateTime.now());

        commentRepository.save(comment);

        return mapToResponse(comment);
    }

    public void deleteComment(String commentId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own comment.");
        }

        // Delete replies if this is a root comment
        if (comment.getParentCommentId() == null) {
            commentRepository.deleteByParentCommentId(comment.getId());
        }

        commentRepository.delete(comment);
    }

    private CommentResponse mapToResponse(Comment comment) {

        User user = userRepository.findById(comment.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String seed = user.getAvatarSeed() != null ? user.getAvatarSeed() : "default-avatar";

        return CommentResponse.builder()
                .id(comment.getId())
                .userId(user.getId())
                .authorName(user.getName())
                .authorProfilePicture(user.getProfilePicture())
                .authorAvatarSeed(seed)
                .avatarSeed(seed)
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    public CommentResponse replyToComment(CreateReplyRequest request) {

        // Get current logged-in user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Find parent comment
        Comment parentComment = commentRepository.findById(request.getParentCommentId())
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        // Create reply
        Comment reply = Comment.builder()
                .experienceId(parentComment.getExperienceId())
                .parentCommentId(parentComment.getId())
                .userId(user.getId())
                .content(request.getContent())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        commentRepository.save(reply);
        if (!parentComment.getUserId().equals(user.getId())) {

            notificationService.createCommentReplyNotification(
                    parentComment.getUserId(),   // receiver
                    user.getId(),                // sender
                    parentComment.getExperienceId(),
                    user.getName()
            );
        }

        return mapToResponse(reply);
    }
}

