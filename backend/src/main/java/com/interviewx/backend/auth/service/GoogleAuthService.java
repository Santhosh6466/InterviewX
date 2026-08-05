package com.interviewx.backend.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.interviewx.backend.auth.dto.response.AuthResponse;
import com.interviewx.backend.auth.enums.AuthProvider;
import com.interviewx.backend.auth.enums.Role;
import com.interviewx.backend.auth.entity.User;
import com.interviewx.backend.auth.repository.UserRepository;
import com.interviewx.backend.security.jwt.JwtService;
import com.interviewx.backend.security.user.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;

@Service
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    @Value("${google.client-id}")
    private String googleClientId;

    public GoogleAuthService(UserRepository userRepository,
                             JwtService jwtService,
                             CustomUserDetailsService customUserDetailsService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.customUserDetailsService = customUserDetailsService;
    }

    public AuthResponse authenticateWithGoogle(String idTokenString) {

        GoogleIdToken.Payload payload = verifyGoogleToken(idTokenString);

        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {

                    User newUser = new User();
                    newUser.setName(name);
                    newUser.setEmail(email);
                    newUser.setPassword(null);
                    newUser.setRole(Role.USER); // Change if your default role is different
                    newUser.setVerified(true);
                    newUser.setProfileImage(picture);
                    newUser.setAuthProvider(AuthProvider.GOOGLE);
                    newUser.setCreatedAt(LocalDateTime.now());

                    return userRepository.save(newUser);
                });

        UserDetails userDetails =
                customUserDetailsService.loadUserByUsername(user.getEmail());

        String jwt = jwtService.generateToken(userDetails);



        return new AuthResponse(
                jwt,
                "Google login successful",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getProfileImage(),
                user.getAvatarSeed()
        );
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idTokenString) {

        try {

            GoogleIdTokenVerifier verifier =
                    new GoogleIdTokenVerifier.Builder(
                            new NetHttpTransport(),
                            GsonFactory.getDefaultInstance())
                            .setAudience(Collections.singletonList(googleClientId))
                            .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken == null) {
                throw new RuntimeException("Invalid Google ID Token");
            }

            return idToken.getPayload();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e.getMessage(), e);
        }
    }
}
