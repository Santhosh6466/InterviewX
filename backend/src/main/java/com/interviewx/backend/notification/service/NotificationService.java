package com.interviewx.backend.notification.service;

import com.interviewx.backend.auth.entity.User;
import com.interviewx.backend.auth.repository.UserRepository;
import com.interviewx.backend.common.exception.ResourceNotFoundException;
import com.interviewx.backend.common.exception.UnauthorizedException;
import com.interviewx.backend.notification.dto.response.NotificationResponse;
import com.interviewx.backend.notification.dto.response.UnreadCountResponse;
import com.interviewx.backend.notification.entity.Notification;
import com.interviewx.backend.notification.enums.NotificationType;
import com.interviewx.backend.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Async
    public void createLikeNotification(
            String receiverId,
            String senderId,
            String experienceId,
            String senderName
    ) {

        Notification notification = Notification.builder()
                .receiverId(receiverId)
                .senderId(senderId)
                .experienceId(experienceId)
                .type(NotificationType.LIKE)
                .message(senderName + " liked your interview experience.")
                .read(false)
                .build();

        notificationRepository.save(notification);
    }

    @Async
    public void createCommentNotification(
            String receiverId,
            String senderId,
            String experienceId,
            String senderName
    ) {

        Notification notification = Notification.builder()
                .receiverId(receiverId)
                .senderId(senderId)
                .experienceId(experienceId)
                .type(NotificationType.COMMENT)
                .message(senderName + " commented on your interview experience.")
                .read(false)
                .build();

        notificationRepository.save(notification);
    }

    public Page<NotificationResponse> getNotifications(int page, int size) {

        User currentUser = getCurrentUser();

        Pageable pageable = PageRequest.of(page, size);

        return notificationRepository
                .findByReceiverIdOrderByCreatedAtDesc(currentUser.getId(), pageable)
                .map(this::mapToResponse);
    }

    private NotificationResponse mapToResponse(Notification notification) {

        User sender = userRepository.findById(notification.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        String seed = sender.getAvatarSeed() != null ? sender.getAvatarSeed() : "default-avatar";

        return NotificationResponse.builder()
                .id(notification.getId())
                .senderId(sender.getId())
                .senderName(sender.getName())
                .senderProfilePicture(sender.getProfilePicture())
                .senderAvatarSeed(seed)
                .experienceId(notification.getExperienceId())
                .type(notification.getType())
                .message(notification.getMessage())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UnreadCountResponse getUnreadCount() {

        User currentUser = getCurrentUser();

        long count = notificationRepository
                .countByReceiverIdAndReadFalse(currentUser.getId());

        return UnreadCountResponse.builder()
                .count(count)
                .build();
    }

    public void markAsRead(String notificationId) {

        User currentUser = getCurrentUser();

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getReceiverId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to access this notification.");
        }

        notification.setRead(true);

        notificationRepository.save(notification);
    }

    public void markAllAsRead() {

        User currentUser = getCurrentUser();

        List<Notification> notifications =
                notificationRepository.findByReceiverIdAndReadFalse(currentUser.getId());

        notifications.forEach(notification -> notification.setRead(true));

        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(String notificationId) {

        User currentUser = getCurrentUser();

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getReceiverId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this notification.");
        }

        notificationRepository.delete(notification);
    }

    public void createCommentReplyNotification(
            String receiverId,
            String senderId,
            String experienceId,
            String senderName) {

        Notification notification = Notification.builder()
                .receiverId(receiverId)
                .senderId(senderId)
                .experienceId(experienceId)
                .type(NotificationType.COMMENT_REPLY)
                .message(senderName + " replied to your comment.")
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }
}