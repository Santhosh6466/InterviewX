package com.interviewx.backend.like.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "likes")
@CompoundIndex(
        name = "experience_user_unique",
        def = "{'experienceId':1,'userId':1}",
        unique = true
)
public class Like {

    @Id
    private String id;

    private String experienceId;

    private String userId;

    private LocalDateTime createdAt;
}
