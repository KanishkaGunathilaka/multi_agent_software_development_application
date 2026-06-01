package com.example.todo.exception;

import com.example.todo.dto.ErrorResponseDto;
import jakarta.servlet.http.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.autoconfigure.web.servlet.*;
import org.springframework.http.*;
import org.springframework.test.web.servlet.*;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = TestController.class)
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void handleTodoNotFound_Returns404ProblemDetails() throws Exception {
        mockMvc.perform(get("/test/notfound"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.title", is("Not Found")))
                .andExpect(jsonPath("$.type", is("about:blank")))
                .andExpect(jsonPath("$.timestamp", notNullValue()));
    }

    @Test
    void handleValidationError_Returns400ProblemDetails() throws Exception {
        mockMvc.perform(post("/test/validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"value\":\"\"}")) // Assume @NotBlank on value
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.title", containsStringIgnoringCase("validation")))
                .andExpect(jsonPath("$.detail", containsString("must not be blank")));
    }

    // -------------------------------------------------------------------------
    // Helper controller to trigger exceptions
    // -------------------------------------------------------------------------
    @RestController
    @RequestMapping("/test")
    static class TestController {

        @GetMapping("/notfound")
        public void triggerNotFound() {
            throw new TodoNotFoundException(java.util.UUID.randomUUID());
        }

        @PostMapping("/validation")
        public void triggerValidation(@Valid @RequestBody DummyDto dto) {
            // No-op
        }
    }

    static class DummyDto {
        @jakarta.validation.constraints.NotBlank
        private String value;

        // getters and setters
        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
    }
}
