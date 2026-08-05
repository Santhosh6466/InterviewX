package com.interviewx.backend.like.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikeResponse {

    private boolean liked;

    private long likesCount;
}
