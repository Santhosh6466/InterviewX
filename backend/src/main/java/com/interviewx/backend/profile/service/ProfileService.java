package com.interviewx.backend.profile.service;

import com.interviewx.backend.company.dto.response.CompanyResponse;
import com.interviewx.backend.company.repository.CompanyRepository;
import com.interviewx.backend.company.entity.Company;
import com.interviewx.backend.auth.entity.User;
import com.interviewx.backend.common.exception.ResourceNotFoundException;
import com.interviewx.backend.experience.repository.ExperienceRepository;
import com.interviewx.backend.profile.dto.request.UpdateProfileRequest;
import com.interviewx.backend.profile.dto.response.ProfileResponse;
import com.interviewx.backend.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileService {

        private final UserRepository userRepository;
        private final CompanyRepository companyRepository;
        private final ExperienceRepository experienceRepository;

        public ProfileResponse getProfile() {

                String email = SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getName();

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                CompanyResponse companyResponse = null;

                if (user.getCurrentCompanyId() != null) {

                        Company company = companyRepository.findById(user.getCurrentCompanyId())
                                        .orElse(null);

                        if (company != null) {
                                companyResponse = CompanyResponse.builder()
                                                .id(company.getId())
                                                .name(company.getName())
                                                .logoUrl(company.getLogoUrl())
                                                .rating(company.getRating())
                                                .build();
                        }
                }

                return ProfileResponse.builder()
                                .id(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .profilePicture(user.getProfilePicture())
                                .avatarSeed(user.getAvatarSeed() != null ? user.getAvatarSeed() : "default-avatar")
                                .profileCompleted(user.getProfileCompleted())
                                .headline(user.getHeadline())
                                .bio(user.getBio())
                                .college(user.getCollege())
                                .branch(user.getBranch())
                                .graduationYear(user.getGraduationYear())
                                .careerStatus(user.getCareerStatus())
                                .currentCompany(companyResponse)
                                .currentRole(user.getCurrentRole())
                                .linkedinUrl(user.getLinkedinUrl())
                                .githubUrl(user.getGithubUrl())
                                .leetcodeUrl(user.getLeetcodeUrl())
                                .portfolioUrl(user.getPortfolioUrl())
                                .createdAt(user.getCreatedAt())
                                .build();
        }

        public ProfileResponse updateProfile(UpdateProfileRequest request) {

                String email = SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getName();

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                user.setName(request.getName());
                user.setHeadline(request.getHeadline());
                user.setBio(request.getBio());
                user.setCollege(request.getCollege());
                user.setBranch(request.getBranch());
                user.setGraduationYear(request.getGraduationYear());
                user.setCareerStatus(request.getCareerStatus());
                user.setCurrentRole(request.getCurrentRole());
                user.setLinkedinUrl(request.getLinkedinUrl());
                user.setGithubUrl(request.getGithubUrl());
                user.setLeetcodeUrl(request.getLeetcodeUrl());
                user.setPortfolioUrl(request.getPortfolioUrl());
                if (request.getAvatarSeed() != null && !request.getAvatarSeed().isBlank()) {
                        user.setAvatarSeed(request.getAvatarSeed());
                }
                user.setProfileCompleted(true);

                if (request.getCurrentCompanyId() != null && !request.getCurrentCompanyId().isBlank()) {

                        Company company = companyRepository.findById(request.getCurrentCompanyId())
                                        .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

                        user.setCurrentCompanyId(company.getId());
                } else {
                        user.setCurrentCompanyId(null);
                }

                userRepository.save(user);

                return getProfile();
        }

        public ProfileResponse getPublicProfile(String userId) {

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                CompanyResponse currentCompany = null;

                if (user.getCurrentCompanyId() != null) {

                        Company company = companyRepository.findById(user.getCurrentCompanyId())
                                        .orElse(null);

                        if (company != null) {
                                currentCompany = CompanyResponse.builder()
                                                .id(company.getId())
                                                .name(company.getName())
                                                .logoUrl(company.getLogoUrl())
                                                .rating(company.getRating())
                                                .build();
                        }
                }

                return ProfileResponse.builder()
                                .id(user.getId())
                                .name(user.getName())
                                .profilePicture(user.getProfilePicture())
                                .avatarSeed(user.getAvatarSeed() != null ? user.getAvatarSeed() : "default-avatar")
                                .profileCompleted(user.getProfileCompleted())
                                .headline(user.getHeadline())
                                .bio(user.getBio())
                                .college(user.getCollege())
                                .branch(user.getBranch())
                                .graduationYear(user.getGraduationYear())
                                .careerStatus(user.getCareerStatus())
                                .currentCompany(currentCompany)
                                .currentRole(user.getCurrentRole())
                                .linkedinUrl(user.getLinkedinUrl())
                                .githubUrl(user.getGithubUrl())
                                .leetcodeUrl(user.getLeetcodeUrl())
                                .portfolioUrl(user.getPortfolioUrl())
                                .createdAt(user.getCreatedAt())
                                .build();
        }
}
