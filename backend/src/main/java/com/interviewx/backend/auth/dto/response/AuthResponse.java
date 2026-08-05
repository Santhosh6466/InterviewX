package com.interviewx.backend.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String message;

    private String id;
    private String name;
    private String email;
    private String role;
    private String profileImage;
    private String avatarSeed;

}
