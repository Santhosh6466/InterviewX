package com.interviewx.backend.profile.controller;

import com.interviewx.backend.profile.dto.request.UpdateProfileRequest;
import com.interviewx.backend.profile.dto.response.ProfileResponse;
import com.interviewx.backend.profile.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ProfileResponse getProfile() {
        return profileService.getProfile();
    }

    @PutMapping
    public ProfileResponse updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        return profileService.updateProfile(request);
    }

    @GetMapping("/{userId}")
    public ProfileResponse getPublicProfile(@PathVariable String userId) {
        return profileService.getPublicProfile(userId);
    }
}

