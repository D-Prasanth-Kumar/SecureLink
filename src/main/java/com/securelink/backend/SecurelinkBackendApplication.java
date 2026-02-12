package com.securelink.backend;

import com.azure.spring.data.cosmos.repository.config.EnableCosmosRepositories;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SecurelinkBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SecurelinkBackendApplication.class, args);
	}

}
