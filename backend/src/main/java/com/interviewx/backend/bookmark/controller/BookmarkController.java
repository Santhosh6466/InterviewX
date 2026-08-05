package com.interviewx.backend.bookmark.controller;

import com.interviewx.backend.bookmark.entity.Bookmark;
import com.interviewx.backend.bookmark.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @PostMapping("/experiences/{experienceId}/bookmark")
    public void bookmarkExperience(@PathVariable String experienceId) {
        bookmarkService.bookmarkExperience(experienceId);
    }

    @DeleteMapping("/experiences/{experienceId}/bookmark")
    public void removeBookmark(@PathVariable String experienceId) {
        bookmarkService.removeBookmark(experienceId);
    }

    @GetMapping("/users/me/bookmarks")
    public List<Bookmark> getMyBookmarks() {
        return bookmarkService.getMyBookmarks();
    }
}