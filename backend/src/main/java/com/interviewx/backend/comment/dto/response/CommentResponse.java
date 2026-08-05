package com.interviewx.backend.comment.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CommentResponse {

    private String id;

    private String userId;

    private String authorName;

    private String authorProfilePicture;

    private String authorAvatarSeed;

    private String avatarSeed;

    private String content;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<CommentResponse> replies;

    private long replyCount;
}