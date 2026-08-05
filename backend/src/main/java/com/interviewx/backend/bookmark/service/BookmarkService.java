package com.interviewx.backend.bookmark.service;

import com.interviewx.backend.auth.entity.User;
import com.interviewx.backend.auth.repository.UserRepository;
import com.interviewx.backend.bookmark.entity.Bookmark;
import com.interviewx.backend.bookmark.repository.BookmarkRepository;
import com.interviewx.backend.common.exception.ResourceNotFoundException;
import com.interviewx.backend.experience.entity.Experience;
import com.interviewx.backend.experience.repository.ExperienceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookmarkService {
    private final BookmarkRepository bookmarkRepository;
    private final ExperienceRepository experienceRepository;
    private final UserRepository userRepository;

    public void bookmarkExperience(String experienceId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new ResourceNotFoundException("Experience not found"));

        if (bookmarkRepository.existsByExperienceIdAndUserId(experienceId, user.getId())) {
            throw new IllegalArgumentException("Experience already bookmarked.");
        }

        Bookmark bookmark = Bookmark.builder()
                .experienceId(experience.getId())
                .userId(user.getId())
                .createdAt(LocalDateTime.now())
                .build();

        bookmarkRepository.save(bookmark);
    }

    public void removeBookmark(String experienceId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Bookmark bookmark = bookmarkRepository
                .findByExperienceIdAndUserId(experienceId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Bookmark not found"));

        bookmarkRepository.delete(bookmark);
    }


    public List<Bookmark> getMyBookmarks() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return bookmarkRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }
}
