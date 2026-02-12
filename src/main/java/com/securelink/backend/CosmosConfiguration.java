package com.securelink.backend;

import com.azure.cosmos.CosmosClientBuilder;
import com.azure.spring.data.cosmos.config.AbstractCosmosConfiguration;
import com.azure.spring.data.cosmos.config.CosmosConfig;
import com.azure.spring.data.cosmos.repository.config.EnableCosmosRepositories;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCosmosRepositories(basePackages = "com.securelink.backend")
public class CosmosConfiguration extends AbstractCosmosConfiguration {

    @Value("${spring.cloud.azure.cosmos.connection-string}")
    private String connectionString;

    @Value("${spring.cloud.azure.cosmos.database}")
    private String databaseName;

    @Override
    protected String getDatabaseName() {
        return databaseName;
    }

    @Bean
    public CosmosClientBuilder cosmosClientBuilder() {
        String endpoint = "";
        String key = "";

        String[] parts = connectionString.split(";");
        for (String part : parts) {
            if (part.startsWith("AccountEndpoint=")) {
                endpoint = part.substring("AccountEndpoint=".length());
            } else if (part.startsWith("AccountKey=")) {
                key = part.substring("AccountKey=".length());
            }
        }

        // Use the universally supported .endpoint() and .key() methods
        return new CosmosClientBuilder()
                .endpoint(endpoint)
                .key(key);
    }

    @Override
    public CosmosConfig cosmosConfig() {
        return CosmosConfig.builder()
                .enableQueryMetrics(true)
                .build();
    }
}
