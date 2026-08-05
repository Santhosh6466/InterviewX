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
import java.util.*;
import java.util.stream.Collectors;

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

        if (!experience.getUserId().equals(user.getId())) {
            notificationService.createCommentNotification(
                    experience.getUserId(),
                    user.getId(),
                    experience.getId(),
                    user.getName()
            );
        }

        return mapCommentToResponse(comment, Collections.singletonMap(user.getId(), user));
    }

    // Get all comments for an experience (optimized in 2 queries total)
    public List<CommentResponse> getCommentsByExperience(String experienceId) {

        experienceRepository.findById(experienceId)
                .orElseThrow(() -> new ResourceNotFoundException("Experience not found"));

        List<Comment> allComments = commentRepository.findByExperienceIdOrderByCreatedAtDesc(experienceId);

        if (allComments == null || allComments.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> userIds = allComments.stream()
                .map(Comment::getUserId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<String, User> userMap = userIds.isEmpty() ? Collections.emptyMap()
                : userRepository.findAllById(userIds).stream()
                        .collect(Collectors.toMap(User::getId, u -> u, (a, b) -> a));

        // Group replies by parentCommentId and sort them ascending by createdAt
        Map<String, List<Comment>> repliesByParent = allComments.stream()
                .filter(c -> c.getParentCommentId() != null)
                .collect(Collectors.groupingBy(Comment::getParentCommentId));

        // Root comments (parentCommentId == null) ordered descending by createdAt
        List<Comment> rootComments = allComments.stream()
                .filter(c -> c.getParentCommentId() == null)
                .toList();

        return rootComments.stream().map(comment -> {
            CommentResponse response = mapCommentToResponse(comment, userMap);

            List<Comment> replies = repliesByParent.getOrDefault(comment.getId(), Collections.emptyList()).stream()
                    .sorted((a, b) -> {
                        if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
                        return a.getCreatedAt().compareTo(b.getCreatedAt());
                    })
                    .toList();

            List<CommentResponse> replyResponses = replies.stream()
                    .map(reply -> mapCommentToResponse(reply, userMap))
                    .toList();

            response.setReplies(replyResponses);
            response.setReplyCount(replyResponses.size());

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

        return mapCommentToResponse(comment, Collections.singletonMap(user.getId(), user));
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

        return mapCommentToResponse(reply, Collections.singletonMap(user.getId(), user));
    }

    private CommentResponse mapCommentToResponse(Comment comment, Map<String, User> userMap) {
        User user = comment.getUserId() != null ? userMap.get(comment.getUserId()) : null;
        String name = user != null ? user.getName() : "Anonymous User";
        String profilePic = user != null ? user.getProfilePicture() : null;
        String seed = (user != null && user.getAvatarSeed() != null) ? user.getAvatarSeed() : "default-avatar";

        return CommentResponse.builder()
                .id(comment.getId())
                .userId(comment.getUserId())
                .authorName(name)
                .authorProfilePicture(profilePic)
                .authorAvatarSeed(seed)
                .avatarSeed(seed)
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
