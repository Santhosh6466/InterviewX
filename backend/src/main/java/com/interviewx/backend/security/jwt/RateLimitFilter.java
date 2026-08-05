package com.interviewx.backend.security.jwt;

import com.interviewx.backend.security.RateLimiterService;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimiterService rateLimiterService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (path.equals("/auth/send-otp")
                || path.equals("/auth/verify-otp")
                || path.equals("/auth/register")
                || path.equals("/auth/login")) {

            String clientIp = request.getRemoteAddr();
            Bucket bucket = rateLimiterService.resolveBucket(clientIp);
            var probe = bucket.tryConsumeAndReturnRemaining(1);

            if (!probe.isConsumed()) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("""
                {
                    "status": 429,
                    "message": "Too many requests. Please try again later."
                }
                """);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
