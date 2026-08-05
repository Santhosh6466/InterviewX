package com.interviewx.backend.bookmark.entity;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;


@Builder
@Data
@Document(collection = "bookmarks")
public class Bookmark {

    @Id
    private String id;

    private String userId;

    private String experienceId;

    private LocalDateTime createdAt;
}