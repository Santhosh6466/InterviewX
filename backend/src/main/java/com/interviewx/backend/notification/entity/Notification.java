package com.interviewx.backend.notification.entity;

import com.interviewx.backend.notification.enums.NotificationType;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private String id;

    // User receiving the notification
    private String receiverId;

    // User who performed the action
    private String senderId;

    // Related interview experience
    private String experienceId;

    private NotificationType type;

    private String message;

    @Builder.Default
    private boolean read = false;

    @CreatedDate
    private LocalDateTime createdAt;
}