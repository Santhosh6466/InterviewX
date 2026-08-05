package com.interviewx.backend.comment.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateReplyRequest {

    @NotBlank
    private String parentCommentId;

    @NotBlank
    private String content;
}
