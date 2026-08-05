package com.interviewx.backend.auth.service;

import com.interviewx.backend.auth.dto.request.LoginRequest;
import com.interviewx.backend.auth.dto.request.RegisterRequest;
import com.interviewx.backend.auth.dto.response.AuthResponse;
import com.interviewx.backend.auth.entity.User;
import com.interviewx.backend.auth.entity.VerifiedEmail;
import com.interviewx.backend.auth.enums.Role;
import com.interviewx.backend.auth.repository.UserRepository;
import com.interviewx.backend.auth.repository.VerifiedEmailRepository;
import com.interviewx.backend.common.exception.BadRequestException;
import com.interviewx.backend.security.jwt.JwtService;
import com.interviewx.backend.security.user.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final VerifiedEmailRepository verifiedEmailRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public AuthResponse register(RegisterRequest request) {

        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered.");
        }

        // Check if email is OTP verified
        VerifiedEmail verifiedEmail = verifiedEmailRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new BadRequestException("Please verify your email first.")
                );

        // Check verification expiry
        if (verifiedEmail.getExpiryTime().isBefore(LocalDateTime.now())) {
            verifiedEmailRepository.deleteByEmail(request.getEmail());
            throw new BadRequestException("Email verification has expired. Please verify again.");
        }

        // Create user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setVerified(true);
        user.setAvatarSeed(UUID.randomUUID().toString());
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // Email verification is no longer needed
        verifiedEmailRepository.deleteByEmail(request.getEmail());

        // Generate JWT
        UserDetails userDetails =
                userDetailsService.loadUserByUsername(savedUser.getEmail());

        String token = jwtService.generateToken(userDetails);

        // Return logged-in user
        return new AuthResponse(
                token,
                "Registration successful",
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                savedUser.getProfileImage(),
                savedUser.getAvatarSeed()
        );
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(
                token,
                "Logged in successfully",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getProfileImage(),
                user.getAvatarSeed()
        );
    }
}