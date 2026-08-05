package com.interviewx.backend.like.controller;

import com.interviewx.backend.like.dto.response.LikeResponse;
import com.interviewx.backend.like.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/experiences")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/{experienceId}/like")
    public LikeResponse like(@PathVariable String experienceId) {
        return likeService.likeExperience(experienceId);
    }

    @DeleteMapping("/{experienceId}/like")
    public LikeResponse unlike(@PathVariable String experienceId) {
        return likeService.unlikeExperience(experienceId);
    }

    @GetMapping("/{experienceId}/like")
    public Map<String, Boolean> hasLiked(@PathVariable String experienceId) {
        return Map.of(
                "liked",
                likeService.hasLiked(experienceId)
        );
    }
}
