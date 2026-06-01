package com.example.todo.api;

import com.example.todo.dto.*;
import com.example.todo.domain.TodoStatus;
import com.example.todo.service.TodoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * REST controller exposing Todo CRUD operations.
 */
@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {

    private final TodoService todoService;

    @PostMapping
    public ResponseEntity<TodoResponseDto> createTodo(
            @Valid @RequestBody TodoCreateDto dto) {
        TodoResponseDto created = todoService.createTodo(dto);
        return ResponseEntity.created(
                        linkToTodo(created.getId()))
                .body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TodoResponseDto> getTodo(@PathVariable UUID id) {
        TodoResponseDto dto = todoService.getTodoById(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<PagedResponseDto<TodoResponseDto>> listTodos(
            @RequestParam(required = false) TodoStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dueBefore,
            @ParameterObject Pageable pageable) {

        // Ensure a default sort if none provided
        Pageable effectivePageable = pageable;
        if (pageable.getSort().isUnsorted()) {
            effectivePageable = PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "createdAt"));
        }

        PagedResponseDto<TodoResponseDto> page = todoService.listTodos(status, dueBefore, effectivePageable);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TodoResponseDto> updateTodo(
            @PathVariable UUID id,
            @Valid @RequestBody TodoUpdateDto dto) {
        TodoResponseDto updated = todoService.updateTodo(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable UUID id) {
        todoService.deleteTodo(id);
        return ResponseEntity.noContent().build();
    }

    private static java.net.URI linkToTodo(UUID id) {
        return java.net.URI.create("/api/todos/" + id);
    }
}
