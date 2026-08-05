package com.interviewx.backend.comment.controller;

import com.interviewx.backend.comment.dto.request.CreateCommentRequest;
import com.interviewx.backend.comment.dto.request.CreateReplyRequest;
import com.interviewx.backend.comment.dto.request.UpdateCommentRequest;
import com.interviewx.backend.comment.dto.response.CommentResponse;
import com.interviewx.backend.comment.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @PostMapping("/experiences/{experienceId}/comments")
    public CommentResponse createComment(
            @PathVariable String experienceId,
            @Valid @RequestBody CreateCommentRequest request) {

        return commentService.createComment(experienceId, request);
    }

    @GetMapping("/experiences/{experienceId}/comments")
    public List<CommentResponse> getComments(
            @PathVariable String experienceId) {

        return commentService.getCommentsByExperience(experienceId);
    }

    @PutMapping("/comments/{commentId}")
    public CommentResponse updateComment(
            @PathVariable String commentId,
            @Valid @RequestBody UpdateCommentRequest request) {

        return commentService.updateComment(commentId, request);
    }

    @DeleteMapping("/comments/{commentId}")
    public void deleteComment(@PathVariable String commentId) {

        commentService.deleteComment(commentId);
    }

    @PostMapping("/reply")
    public ResponseEntity<CommentResponse> replyToComment(
            @Valid @RequestBody CreateReplyRequest request) {

        CommentResponse response = commentService.replyToComment(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

}
