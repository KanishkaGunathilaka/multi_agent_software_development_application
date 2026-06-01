package com.example.todo.service;

import com.example.todo.dto.*;
import com.example.todo.exception.TodoNotFoundException;
import com.example.todo.exception.TodoConflictException;
import com.example.todo.mapper.TodoMapper;
import com.example.todo.repository.TodoRepository;
import com.example.todo.repository.TodoSpecification;
import com.example.todo.domain.Todo;
import com.example.todo.domain.TodoStatus;
import jakarta.persistence.OptimisticLockException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Implementation of TodoService handling business logic.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TodoServiceImpl implements TodoService {

    private final TodoRepository todoRepository;
    private final TodoMapper todoMapper;

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }
        // Assuming the principal is a String containing the userId (could be a custom UserDetails)
        return auth.getName();
    }

    @Override
    public TodoResponseDto createTodo(TodoCreateDto dto) {
        Todo todo = todoMapper.toEntity(dto);
        todo.setUserId(currentUserId());
        if (todo.getStatus() == null) {
            todo.setStatus(TodoStatus.PENDING);
        }
        Todo saved = todoRepository.save(todo);
        return todoMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TodoResponseDto getTodoById(UUID id) {
        Todo todo = todoRepository.findOne(
                Specification.where(TodoSpecification.belongsToUser(currentUserId()))
                        .and((root, query, cb) -> cb.equal(root.get("id"), id))
        ).orElseThrow(() -> new TodoNotFoundException(id));
        return todoMapper.toDto(todo);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponseDto<TodoResponseDto> listTodos(
            TodoStatus status,
            OffsetDateTime dueBefore,
            Pageable pageable) {

        Specification<Todo> spec = Specification.where(TodoSpecification.belongsToUser(currentUserId()));

        if (status != null) {
            spec = spec.and(TodoSpecification.hasStatus(status));
        }
        if (dueBefore != null) {
            spec = spec.and(TodoSpecification.dueBefore(dueBefore));
        }

        Page<Todo> page = todoRepository.findAll(spec, pageable);
        return PagedResponseDto.<TodoResponseDto>builder()
                .content(page.getContent().stream()
                        .map(todoMapper::toDto)
                        .toList())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    public TodoResponseDto updateTodo(UUID id, TodoUpdateDto dto) {
        Todo existing = todoRepository.findOne(
                Specification.where(TodoSpecification.belongsToUser(currentUserId()))
                        .and((root, query, cb) -> cb.equal(root.get("id"), id))
        ).orElseThrow(() -> new TodoNotFoundException(id));

        todoMapper.updateEntityFromDto(dto, existing);
        try {
            Todo saved = todoRepository.save(existing);
            return todoMapper.toDto(saved);
        } catch (OptimisticLockException ex) {
            throw new TodoConflictException("Concurrent modification detected for Todo ID " + id);
        }
    }

    @Override
    public void deleteTodo(UUID id) {
        try {
            // Ensure the Todo belongs to the current user before deletion
            Todo todo = todoRepository.findOne(
                    Specification.where(TodoSpecification.belongsToUser(currentUserId()))
                            .and((root, query, cb) -> cb.equal(root.get("id"), id))
            ).orElseThrow(() -> new TodoNotFoundException(id));

            todoRepository.delete(todo);
        } catch (EmptyResultDataAccessException ex) {
            throw new TodoNotFoundException(id);
        }
    }
}
