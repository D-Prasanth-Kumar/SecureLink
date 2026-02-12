package com.securelink.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SecretController {

    @Autowired
    private SecretRepository repository;

    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createSecret(@RequestBody Map<String, Object> payload) {
        try {
            String content = (String) payload.get("content");
            String password = (String) payload.get("password");
            Integer ttl = (Integer) payload.get("ttl");

            if(content == null || content.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            String id = UUID.randomUUID().toString();
            String adminToken = UUID.randomUUID().toString();
            String passwordHash = (password != null && !password.isEmpty()) ? hashPassword(password) : null;
            if(ttl == null) ttl = 86400;

            Secret secret = new Secret(id, content, passwordHash, ttl, adminToken);
            repository.save(secret);

            return new ResponseEntity<>(Map.of("id", id, "adminToken", adminToken), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/status/{id}")
    public ResponseEntity<Map<String, Object>> getStatus(@PathVariable String id) {
        Optional<Secret> secretOpt = repository.findById(id);
        if (secretOpt.isPresent()) {
            Secret s = secretOpt.get();
            return new ResponseEntity<>(Map.of(
                    "active", true,
                    "createdAt", s.getCreatedAt(),
                    "expiresIn", s.getTtl()
            ), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(Map.of("active", false), HttpStatus.OK);
        }
    }

    @PostMapping("/burn/{id}")
    public ResponseEntity<String> burnSecret(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<Secret> secretOpt = repository.findById(id);
        if (secretOpt.isPresent()) {
            Secret s = secretOpt.get();
            String providedToken = body.get("adminToken");

            if (providedToken != null && providedToken.equals(s.getAdminToken())) {
                repository.delete(s);
                return new ResponseEntity<>("Burned successfully", HttpStatus.OK);
            }
            return new ResponseEntity<>("Invalid Admin Token", HttpStatus.UNAUTHORIZED);
        }
        return new ResponseEntity<>("Already destroyed", HttpStatus.NOT_FOUND);
    }

    @GetMapping("/check/{id}")
    public ResponseEntity<Map<String, Object>> checkSecret(@PathVariable String id) {
        Optional<Secret> secretOpt = repository.findById(id);
        if (secretOpt.isPresent()) {
            Secret s = secretOpt.get();
            boolean hasPassword = secretOpt.get().getPasswordHash() != null;
            return new ResponseEntity<>(Map.of(
                    "exists", true,
                    "requiresPassword", hasPassword,
                    "remainingAttempts", s.getRemainingAttempts()
            ), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(Map.of("exists", false), HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/view/{id}")
    public ResponseEntity<String> viewSecret(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        Optional<Secret> secretOpt = repository.findById(id);

        if (secretOpt.isPresent()) {
            Secret secret = secretOpt.get();
            String storedHash = secret.getPasswordHash();

            if (storedHash != null) {
                String providedPass = (body != null) ? body.get("password") : null;

                if (providedPass == null || !storedHash.equals(hashPassword(providedPass))) {

                    int lives = secret.getRemainingAttempts() - 1;
                    secret.setRemainingAttempts(lives);

                    if(lives <= 0) {
                        repository.delete(secret);
                        return new ResponseEntity<>("DESTROYED: Too many failed attempts.", HttpStatus.GONE);
                    }else {
                        repository.save(secret);
                        return new ResponseEntity<>("Incorrect Password. " + lives + " attempts remaining.", HttpStatus.UNAUTHORIZED);
                    }
                }
            }

            String content = secret.getContent();
            repository.delete(secret);
            return new ResponseEntity<>(content, HttpStatus.OK);

        } else {
            return new ResponseEntity<>("Secret not found or expired", HttpStatus.NOT_FOUND);
        }
    }

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedhash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Hashing failed");
        }
    }
}
