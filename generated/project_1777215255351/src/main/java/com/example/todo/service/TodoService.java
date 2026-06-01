package com.example.todo.service;

import com.example.todo.dto.*;
import com.example.todo.domain.TodoStatus;
import org.springframework.data.domain.Pageable;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Service interface for Todo business operations.
 */
public interface TodoService {

    /**
     * Creates a new Todo for the currently authenticated user.
     *
     * @param dto data for creation
     * @return created Todo DTO
     */
    TodoResponseDto createTodo(TodoCreateDto dto);

    /**
     * Retrieves a Todo by its id for the current user.
     *
     * @param id Todo id
     * @return Todo DTO
     */
    TodoResponseDto getTodoById(UUID id);

    /**
     * Lists Todos with optional filters and pagination.
     *
     * @param status    optional status filter
     * @param dueBefore optional upper bound for dueDate
     * @param pageable  pagination information
     * @return paged response of Todo DTOs
     */
    PagedResponseDto<TodoResponseDto> listTodos(
            TodoStatus status,
            OffsetDateTime dueBefore,
            Pageable pageable);

    /**
     * Updates an existing Todo.
     *
     * @param id  Todo id
     * @param dto fields to update
     * @return updated Todo DTO
     */
    TodoResponseDto updateTodo(UUID id, TodoUpdateDto dto);

    /**
     * Deletes a Todo.
     *
     * @param id Todo id
     */
    void deleteTodo(UUID id);
}
