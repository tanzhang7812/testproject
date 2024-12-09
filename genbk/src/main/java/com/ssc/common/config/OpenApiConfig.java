package com.ssc.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI authOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Authorization Management System API")
                        .description("APIs for managing users, groups, resources and permissions")
                        .version("1.0")
                        .contact(new Contact()
                                .name("BO")
                                .email("bo@example.com")));
    }
} 