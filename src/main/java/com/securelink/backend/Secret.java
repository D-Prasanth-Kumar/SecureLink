package com.securelink.backend;

import com.azure.spring.data.cosmos.core.mapping.Container;
import com.azure.spring.data.cosmos.core.mapping.PartitionKey;
import org.springframework.data.annotation.Id;

import java.time.Instant;

@Container(containerName = "secrets")
public class Secret {

    @Id
    @PartitionKey
    private String id;
    private String content;
    private String passwordHash;
    private Integer ttl;
    private String adminToken;
    private String createdAt;
    private Integer remainingAttempts;

    public Secret() {}

    public Secret(String id, String content, String passwordHash, Integer ttl, String adminToken) {
        this.id = id;
        this.content = content;
        this.passwordHash = passwordHash;
        this.ttl = ttl;
        this.adminToken = adminToken;
        this.createdAt = Instant.now().toString();
        this.remainingAttempts = 3;
    }

    public String getId() { return id; }

    public void setId(String id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

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
}
