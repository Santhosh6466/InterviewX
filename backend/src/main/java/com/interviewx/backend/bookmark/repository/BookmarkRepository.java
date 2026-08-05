package com.interviewx.backend.bookmark.repository;

import com.interviewx.backend.bookmark.entity.Bookmark;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends MongoRepository<Bookmark, String> {
    Optional<Bookmark> findByExperienceIdAndUserId(String experienceId, String userId);

    boolean existsByExperienceIdAndUserId(String experienceId, String userId);

    void deleteByExperienceIdAndUserId(String experienceId, String userId);

    long countByExperienceId(String experienceId);

    List<Bookmark> findByUserIdOrderByCreatedAtDesc(String userId);
}
