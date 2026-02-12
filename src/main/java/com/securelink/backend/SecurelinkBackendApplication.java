package com.securelink.backend;

import com.azure.spring.data.cosmos.repository.config.EnableCosmosRepositories;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories
public class SecurelinkBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SecurelinkBackendApplication.class, args);
	}

}
