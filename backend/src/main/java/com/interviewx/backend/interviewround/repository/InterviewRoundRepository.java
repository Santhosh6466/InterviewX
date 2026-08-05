package com.interviewx.backend.interviewround.repository;

import com.interviewx.backend.interviewround.entity.InterviewRound;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRoundRepository extends MongoRepository<InterviewRound, String> {

    List<InterviewRound> findByExperienceIdOrderByRoundNumberAsc(String experienceId);

    void deleteByExperienceId(String experienceId);

}
