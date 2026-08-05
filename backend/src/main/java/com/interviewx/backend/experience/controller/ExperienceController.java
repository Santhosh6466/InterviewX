package com.interviewx.backend.experience.controller;

import com.interviewx.backend.experience.dto.request.CreateExperienceRequest;
import com.interviewx.backend.experience.dto.request.UpdateExperienceRequest;
import com.interviewx.backend.experience.dto.response.ExperienceResponse;
import com.interviewx.backend.experience.enums.Difficulty;
import com.interviewx.backend.experience.enums.ExperienceLevel;
import com.interviewx.backend.experience.enums.InterviewResult;
import com.interviewx.backend.experience.enums.InterviewType;
import com.interviewx.backend.experience.service.ExperienceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/experiences")
@RequiredArgsConstructor
public class ExperienceController {

    private final ExperienceService experienceService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExperienceResponse createExperience(
            @Valid @RequestBody CreateExperienceRequest request) {

        return experienceService.createExperience(request);
    }

    @GetMapping("/{experienceId}")
    public ExperienceResponse getExperienceById(
            @PathVariable String experienceId) {

        return experienceService.getExperienceById(experienceId);
    }

//    @GetMapping
//    public Page<ExperienceResponse> getAllExperiences(
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size) {
//
//        return experienceService.getAllExperiences(page, size);
//    }

    @PutMapping("/{experienceId}")
    public ExperienceResponse updateExperience(
            @PathVariable String experienceId,
            @Valid @RequestBody UpdateExperienceRequest request) {

        return experienceService.updateExperience(experienceId, request);
    }

    @DeleteMapping("/{experienceId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExperience(
            @PathVariable String experienceId) {

        experienceService.deleteExperience(experienceId);
    }

    @GetMapping
    public ResponseEntity<Page<ExperienceResponse>> getExperiences(

            @RequestParam(required = false) String search,
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) ExperienceLevel experienceLevel,
            @RequestParam(required = false) InterviewType interviewType,
            @RequestParam(required = false) InterviewResult result,
            @RequestParam(required = false) Difficulty difficulty,

            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return ResponseEntity.ok(
                experienceService.searchExperiences(
                        search,
                        companyId,
                        experienceLevel,
                        interviewType,
                        result,
                        difficulty,
                        pageable
                )
        );
    }

    @GetMapping("/company/{companyId}")
    public Page<ExperienceResponse> getExperiencesByCompany(
            @PathVariable String companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return experienceService.getExperiencesByCompany(
                companyId,
                page,
                size
        );
    }


}
