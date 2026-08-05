package com.interviewx.backend.company.service;

import com.interviewx.backend.company.dto.response.CompanyResponse;
import com.interviewx.backend.company.repository.CompanyRepository;
import com.interviewx.backend.company.entity.Company;
import com.interviewx.backend.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;

    public List<CompanyResponse> getAllCompanies() {

        List<Company> companies = companyRepository.findAll();

        return companies.stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CompanyResponse getCompanyById(String companyId) {

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Company not found"));

        return mapToResponse(company);
    }

    private CompanyResponse mapToResponse(Company company) {

        CompanyResponse response = new CompanyResponse();

        response.setId(company.getId());
        response.setName(company.getName());
        response.setLogoUrl(company.getLogoUrl());

        response.setRating(company.getRating());
        response.setTotalRating(company.getTotalRating());

        response.setDescription(company.getDescription());
        response.setPositives(company.getPositives());

        response.setReviews(company.getReviews());
        response.setSalaries(company.getSalaries());
        response.setInterviews(company.getInterviews());

        response.setJobs(company.getJobs());
        response.setBenefits(company.getBenefits());

        response.setPhotos(company.getPhotos());

        return response;
    }

    public Page<CompanyResponse> searchCompanies(String query,
                                                 int page,
                                                 int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<Company> companies =
                companyRepository.findByNameContainingIgnoreCase(query, pageable);

        return companies.map(this::mapToResponse);
    }
}
