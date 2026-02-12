package com.securelink.backend;

import com.azure.spring.data.cosmos.repository.CosmosRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SecretRepository extends CosmosRepository<Secret, String> {
}
