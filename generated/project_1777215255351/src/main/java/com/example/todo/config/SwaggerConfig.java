package com.example.todo.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.*;

/**
 * OpenAPI configuration for Swagger UI.
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Todo API")
                        .description("REST API for managing Todo items")
                        .version("1.0.0"));
    }

    @Bean
    public GroupedOpenApi todoApi() {
        return GroupedOpenApi.builder()
                .group("todos")
                .pathsToMatch("/api/todos/**")
                .build();
    }
}
