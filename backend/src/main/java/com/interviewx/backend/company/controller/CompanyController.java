package com.interviewx.backend.company.controller;

import com.interviewx.backend.company.dto.response.CompanyResponse;
import com.interviewx.backend.company.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public List<CompanyResponse> getAllCompanies() {
        return companyService.getAllCompanies();
    }

    @GetMapping("/search")
    public Page<CompanyResponse> searchCompanies(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return companyService.searchCompanies(query, page, size);
    }

    @GetMapping("/{companyId}")
    public CompanyResponse getCompanyById(@PathVariable String companyId) {
        return companyService.getCompanyById(companyId);
    }
}
