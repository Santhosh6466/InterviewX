package com.interviewx.backend.like.repository;

import com.interviewx.backend.like.entity.Like;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface LikeRepository extends MongoRepository<Like, String> {

    Optional<Like> findByExperienceIdAndUserId(
            String experienceId,
            String userId
    );

    boolean existsByExperienceIdAndUserId(
            String experienceId,
            String userId
    );

    long countByExperienceId(String experienceId);

    List<Like> findByExperienceIdIn(List<String> experienceIds);

    List<Like> findByExperienceIdInAndUserId(
            List<String> experienceIds,
            String userId
    );

    void deleteByExperienceIdAndUserId(
            String experienceId,
            String userId
    );
}
