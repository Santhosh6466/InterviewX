package com.interviewx.backend.experience.repository;

import com.interviewx.backend.experience.entity.Experience;
import com.interviewx.backend.experience.enums.Difficulty;
import com.interviewx.backend.experience.enums.ExperienceLevel;
import com.interviewx.backend.experience.enums.InterviewResult;
import com.interviewx.backend.experience.enums.InterviewType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class ExperienceRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    public Page<Experience> search(
            String search,
            String companyId,
            ExperienceLevel level,
            InterviewType type,
            InterviewResult result,
            Difficulty difficulty,
            Pageable pageable) {

        List<Criteria> criteriaList = new ArrayList<>();

        if (StringUtils.hasText(search)) {
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("title").regex(search, "i"),
                    Criteria.where("role").regex(search, "i")));
        }

        if (StringUtils.hasText(companyId)) {
            criteriaList.add(Criteria.where("companyId").is(companyId));
        }

        if (level != null) {
            criteriaList.add(Criteria.where("experienceLevel").is(level));
        }

        if (type != null) {
            criteriaList.add(Criteria.where("interviewType").is(type));
        }

        if (result != null) {
            criteriaList.add(Criteria.where("interviewResult").is(result));
        }

        if (difficulty != null) {
            criteriaList.add(Criteria.where("difficulty").is(difficulty));
        }

        Query query = new Query();

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList));
        }

        long total = mongoTemplate.count(query, Experience.class);

        query.with(pageable);

        List<Experience> data = mongoTemplate.find(query, Experience.class);

        return new PageImpl<>(data, pageable, total);
    }
}