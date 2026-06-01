package com.example.todo.api;

import com.example.todo.dto.*;
import com.example.todo.domain.TodoStatus;
import com.example.todo.security.JwtTokenProvider;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.*;
import org.springframework.http.*;
import org.springframework.test.context.*;
import org.springframework.test.web.servlet.*;
import org.testcontainers.containers.*;
import org.testcontainers.junit.jupiter.*;

import java.time.*;
import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Testcontainers
@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class TodoControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("todo_db")
            .withUsername("todo_user")
            .withPassword("todo_pass");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String authHeader;

    @BeforeAll
    void setUpDatabaseProperties() {
        // Override datasource properties for the test
        System.setProperty("spring.datasource.url", postgres.getJdbcUrl());
        System.setProperty("spring.datasource.username", postgres.getUsername());
        System.setProperty("spring.datasource.password", postgres.getPassword());

        // Generate a valid JWT for tests
        String token = jwtTokenProvider.createToken("test-user-id");
        authHeader = "Bearer " + token;
    }

    @Test
    void createTodo_Returns201AndLocation() throws Exception {
        TodoCreateDto createDto = TodoCreateDto.builder()
                .title("Integration Test Todo")
                .description("Integration description")
                .dueDate(OffsetDateTime.now().plusDays(2))
                .status(TodoStatus.PENDING)
                .build();

        mockMvc.perform(post("/api/todos")
                        .header(HttpHeaders.AUTHORIZATION, authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(createDto)))
                .andExpect(status().isCreated())
                .andExpect(header().string(HttpHeaders.LOCATION, matchesPattern(".*/api/todos/[0-9a-fA-F\\-]+")))
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.title", is("Integration Test Todo")))
                .andExpect(jsonPath("$.userId", is("test-user-id")));
    }

    @Test
    void createTodo_InvalidPayload_Returns400() throws Exception {
        // title missing
        String payload = "{\"description\":\"No title\"}";

        mockMvc.perform(post("/api/todos")
                        .header(HttpHeaders.AUTHORIZATION, authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.title", containsStringIgnoringCase("validation")));
    }

    @Test
    void getTodoById_Found() throws Exception {
        // First create a Todo
        TodoCreateDto createDto = TodoCreateDto.builder()
                .title("GetById Todo")
                .build();

        MvcResult result = mockMvc.perform(post("/api/todos")
                        .header(HttpHeaders.AUTHORIZATION, authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(createDto)))
                .andExpect(status().isCreated())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        TodoResponseDto created = fromJson(body, TodoResponseDto.class);
        UUID id = created.getId();

        // Retrieve it
        mockMvc.perform(get("/api/todos/{id}", id)
                        .header(HttpHeaders.AUTHORIZATION, authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(id.toString())))
                .andExpect(jsonPath("$.title", is("GetById Todo")));
    }

    @Test
    void getTodoById_NotFound_Returns404() throws Exception {
        UUID randomId = UUID.randomUUID();
        mockMvc.perform(get("/api/todos/{id}", randomId)
                        .header(HttpHeaders.AUTHORIZATION, authHeader))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)));
    }

    @Test
    void listTodos_DefaultPagination_ReturnsPagedResponse() throws Exception {
        // Ensure at least one record exists
        TodoCreateDto createDto = TodoCreateDto.builder()
                .title("List Todo")
                .build();
        mockMvc.perform(post("/api/todos")
                        .header(HttpHeaders.AUTHORIZATION, authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(createDto)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/todos")
                        .header(HttpHeaders.AUTHORIZATION, authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.pageNumber", is(0)))
                .andExpect(jsonPath("$.pageSize", is(20))) // default size
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(1)));
    }

    @Test
    void listTodos_WithFilters() throws Exception {
        // Create two todos with different statuses
        TodoCreateDto pending = TodoCreateDto.builder()
                .title("Pending Todo")
                .status(TodoStatus.PENDING)
                .build();
        TodoCreateDto completed = TodoCreateDto.builder()
                .title("Completed Todo")
                .status(TodoStatus.COMPLETED)
                .build();

        mockMvc.perform(post("/api/todos")
                        .header(HttpHeaders.AUTHORIZATION, authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(pending)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/todos")
                        .header(HttpHeaders.AUTHORIZATION, authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(completed)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/todos")
                        .header(HttpHeaders.AUTHORIZATION, authHeader)
                        .param("status", "COMPLETED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].status", everyItem(is("COMPLETED"))));
    }

    @Test
    void updateTodo_HappyPath() throws Exception {
        // Create
        TodoCreateDto createDto = TodoCreateDto.builder()
                .title("Original Title")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/todos")
                        .header(HttpHeaders.AUTHORIZATION, authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(createDto)))
                .andExpect(status().isCreated())
                .andReturn();

        TodoResponseDto created = fromJson(createResult.getResponse().getContentAsString(), TodoResponseDto.class);
        UUID id = created.getId();

        // Update
        TodoUpdateDto updateDto = TodoUpdateDto.builder()
                .title("Updated Title")
                .status(TodoStatus.COMPLETED)
                .build();

        mockMvc.perform(put("/api/todos/{id}", id)
                        .header(HttpHeaders.AUTHORIZATION, authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Updated Title")))
                .andExpect(jsonPath("$.status", is("COMPLETED")));
    }

    @Test
    void updateTodo_NotFound_Returns404() throws Exception {
        UUID nonExistingId = UUID.randomUUID();
        TodoUpdateDto updateDto = TodoUpdateDto.builder()
                .title("Doesn't matter")
                .build();

        mockMvc.perform(put("/api/todos/{id}", nonExistingId)
                        .header(HttpHeaders.AUTHORIZATION, authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(updateDto)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)));
    }

    @Test
    void deleteTodo_HappyPath() throws Exception {
        // Create
        TodoCreateDto createDto = TodoCreateDto.builder()
                .title("To be deleted")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/todos")
                        .header(HttpHeaders.AUTHORIZATION, authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(createDto)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID id = fromJson(createResult.getResponse().getContentAsString(), TodoResponseDto.class).getId();

        // Delete
        mockMvc.perform(delete("/api/todos/{id}", id)
                        .header(HttpHeaders.AUTHORIZATION, authHeader))
                .andExpect(status().isNoContent());

        // Verify it's gone
        mockMvc.perform(get("/api/todos/{id}", id)
                        .header(HttpHeaders.AUTHORIZATION, authHeader))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteTodo_NotFound_Returns404() throws Exception {
        UUID randomId = UUID.randomUUID();
        mockMvc.perform(delete("/api/todos/{id}", randomId)
                        .header(HttpHeaders.AUTHORIZATION, authHeader))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)));
    }

    @Test
    void unauthenticatedRequest_Returns401() throws Exception {
        mockMvc.perform(get("/api/todos"))
                .andExpect(status().isUnauthorized());
    }

    // -------------------------------------------------------------------------
    // Helper methods for JSON (using Jackson)
    // -------------------------------------------------------------------------
    private static final com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper()
            .findAndRegisterModules();

    private static String asJson(Object obj) throws Exception {
        return mapper.writeValueAsString(obj);
    }

    private static <T> T fromJson(String json, Class<T> clazz) throws Exception {
        return mapper.readValue(json, clazz);
    }
}
