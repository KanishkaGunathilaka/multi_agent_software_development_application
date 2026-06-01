package com.example.todo.dto;

import com.example.todo.domain.TodoStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.OffsetDateTime;

/**
 * DTO for creating a new Todo.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TodoCreateDto {

    @NotBlank(message = "Title must not be blank")
    @Size(max = 255, message = "Title must be at most 255 characters")
    private String title;

    private String description;

    @FutureOrPresent(message = "Due date must be in the future or present")
    private OffsetDateTime dueDate;

    private TodoStatus status; // optional, defaults to PENDING
}
