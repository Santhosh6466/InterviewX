package com.interviewx.backend.interviewround.controller;

import com.interviewx.backend.interviewround.dto.request.CreateInterviewRoundRequest;
import com.interviewx.backend.interviewround.dto.request.UpdateInterviewRoundRequest;
import com.interviewx.backend.interviewround.dto.response.InterviewRoundResponse;
import com.interviewx.backend.interviewround.service.InterviewRoundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interview-rounds")
@RequiredArgsConstructor
public class InterviewRoundController {

    private final InterviewRoundService interviewRoundService;

    @PostMapping
    public InterviewRoundResponse createInterviewRound(
            @Valid @RequestBody CreateInterviewRoundRequest request) {

        return interviewRoundService.createInterviewRound(request);
    }

    @GetMapping("/experience/{experienceId}")
    public List<InterviewRoundResponse> getRoundsByExperience(
            @PathVariable String experienceId) {

        return interviewRoundService.getRoundsByExperience(experienceId);
    }

    @PutMapping("/{roundId}")
    public InterviewRoundResponse updateInterviewRound(
            @PathVariable String roundId,
            @Valid @RequestBody UpdateInterviewRoundRequest request) {

        return interviewRoundService.updateInterviewRound(roundId, request);
    }

    @DeleteMapping("/{roundId}")
    public void deleteInterviewRound(@PathVariable String roundId) {

        interviewRoundService.deleteInterviewRound(roundId);
    }
}
