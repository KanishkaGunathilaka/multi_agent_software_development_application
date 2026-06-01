package com.example.todo.dto;

import com.example.todo.domain.TodoStatus;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO representing a Todo exposed via the API.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TodoResponseDto {
    private UUID id;
    private String userId;
    private String title;
    private String description;
    private OffsetDateTime dueDate;
    private TodoStatus status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Long version;
}
