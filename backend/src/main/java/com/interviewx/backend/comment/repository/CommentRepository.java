package com.interviewx.backend.comment.repository;

import com.interviewx.backend.comment.entity.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {

    List<Comment> findByExperienceIdOrderByCreatedAtDesc(String experienceId);

    List<Comment> findByExperienceIdAndParentCommentIdIsNullOrderByCreatedAtDesc(String experienceId);

    List<Comment> findByParentCommentIdOrderByCreatedAtAsc(String parentCommentId);

    void deleteByParentCommentId(String parentCommentId);

    long countByExperienceId(String experienceId);
}