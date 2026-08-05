package com.interviewx.backend.company.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
    public class CompanyResponse {

        private String id;

        private String name;

        private String domain;

        private String logoUrl;

        private Double rating;

        private String totalRating;

        private String description;

        private String positives;

        private String reviews;

        private String salaries;

        private String interviews;

        private String jobs;

        private String benefits;

        private String photos;
    }
