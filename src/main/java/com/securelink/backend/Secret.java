package com.securelink.backend;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "secrets")
public class Secret {

    @Id
    private String id;

    private String content;
    private String passwordHash;
    private Integer ttl;
    private String adminToken;
    private String createdAt;
    private Integer remainingAttempts;
    private List<String> accessLogs;

    public Secret() {}

    public Secret(String id, String content, String passwordHash, Integer ttl, String adminToken) {
        this.id = id;
        this.content = content;
        this.passwordHash = passwordHash;
        this.ttl = ttl;
        this.adminToken = adminToken;
        this.createdAt = Instant.now().toString();
        this.remainingAttempts = 3;
        this.accessLogs = new ArrayList<>();
        this.accessLogs.add("[" + Instant.now().toString() + "] 🟢 Secret Created");
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Integer getTtl() { return ttl; }
    public void setTtl(Integer ttl) { this.ttl = ttl; }

    public String getAdminToken() { return adminToken; }
    public void setAdminToken(String adminToken) { this.adminToken = adminToken; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public Integer getRemainingAttempts() { return remainingAttempts; }
    public void setRemainingAttempts(Integer remainingAttempts) { this.remainingAttempts = remainingAttempts; }

    public List<String> getAccessLogs() { return accessLogs; }
    public void setAccessLogs(List<String> accessLogs) { this.accessLogs = accessLogs; }

    public void addLog(String entry) {
        if(this.accessLogs == null) this.accessLogs = new ArrayList<>();
        this.accessLogs.add("[" + Instant.now().toString() + "] " + entry);
    }
}