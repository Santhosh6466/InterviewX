package com.interviewx.backend.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public Bucket resolveBucket(String clientIp) {

        Bucket bucket = buckets.computeIfAbsent(clientIp, key -> {
            System.out.println("Creating new bucket for: " + key);
            return createNewBucket();
        });

        System.out.println("Current bucket count: " + buckets.size());
        System.out.println("Bucket hash: " + System.identityHashCode(bucket));

        return bucket;
    }

    private Bucket createNewBucket() {

        Bandwidth limit = Bandwidth.builder()
                .capacity(10)
                .refillGreedy(10, Duration.ofMinutes(1))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}
