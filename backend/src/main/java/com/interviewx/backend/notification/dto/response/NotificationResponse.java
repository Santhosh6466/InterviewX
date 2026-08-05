package com.interviewx.backend.notification.dto.response;

import com.interviewx.backend.notification.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private String id;

    // User who triggered the notification
    private String senderId;
    private String senderName;
    private String senderProfilePicture;
    private String senderAvatarSeed;

    // Related experience
    private String experienceId;

    private NotificationType type;

    private String message;

    private boolean read;

    private LocalDateTime createdAt;
}