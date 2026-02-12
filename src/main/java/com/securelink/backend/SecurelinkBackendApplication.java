package com.securelink.backend;

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
