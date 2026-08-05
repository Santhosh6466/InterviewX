package com.interviewx.backend.company.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "companies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Company {

    @Id
    private String id;

    private String name;

    private String domain;

    @Field("company_icon")
    private String logoUrl;

    private Double rating;

    @Field("total_rating")
    private String totalRating;

    private String description;

    private String positives;

    private String reviews;

    private String salaries;

    private String interviews;

    private String jobs;

    private String benefits;

    private String photos;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
