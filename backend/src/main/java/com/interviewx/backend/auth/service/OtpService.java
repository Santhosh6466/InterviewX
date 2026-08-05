package com.interviewx.backend.auth.service;

import com.interviewx.backend.auth.entity.OtpVerification;
import com.interviewx.backend.auth.entity.VerifiedEmail;
import com.interviewx.backend.common.exception.BadRequestException;
import com.interviewx.backend.auth.repository.OtpVerificationRepository;
import com.interviewx.backend.auth.repository.VerifiedEmailRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OtpService {
    private final VerifiedEmailRepository verifiedEmailRepository;
    private final OtpVerificationRepository otpRepository;
    private final EmailService emailService;

    public OtpService(VerifiedEmailRepository verifiedEmailRepository, OtpVerificationRepository otpRepository,
                      EmailService emailService) {
        this.verifiedEmailRepository = verifiedEmailRepository;
        this.otpRepository = otpRepository;
        this.emailService = emailService;
    }

    public void sendOtp(String email) {

        // Delete old OTP if it exists
        otpRepository.deleteByEmail(email);

        // Generate 6-digit OTP
        String otp = String.valueOf(100000 + new Random().nextInt(900000));

        // Create OTP document
        OtpVerification otpVerification = new OtpVerification();
        otpVerification.setEmail(email);
        otpVerification.setOtp(otp);
        otpVerification.setCreatedAt(LocalDateTime.now());
        otpVerification.setExpiryTime(LocalDateTime.now().plusMinutes(5));

        // Save to MongoDB
        otpRepository.save(otpVerification);

        // Send Email
        emailService.sendOtp(email, otp);
    }

    public void verifyOtp(String email, String otp) {

        OtpVerification otpVerification = otpRepository.findByEmail(email)
                .orElseThrow(() ->
                        new BadRequestException("OTP not found. Please request a new OTP."));

        if (otpVerification.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpRepository.deleteByEmail(email);
            throw new BadRequestException("OTP has expired.");
        }

        if (!otpVerification.getOtp().equals(otp)) {
            throw new BadRequestException("Invalid OTP.");
        }

        // Delete OTP after successful verification
        otpRepository.deleteByEmail(email);

        // Remove any previous verification record for this email
        verifiedEmailRepository.deleteByEmail(email);

        // Save fresh verification record
        VerifiedEmail verifiedEmail = new VerifiedEmail();
        verifiedEmail.setEmail(email);
        verifiedEmail.setVerifiedAt(LocalDateTime.now());
        verifiedEmail.setExpiryTime(LocalDateTime.now().plusMinutes(10));

        verifiedEmailRepository.save(verifiedEmail);
    }
}
