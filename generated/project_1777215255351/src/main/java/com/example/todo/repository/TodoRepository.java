package com.example.todo.repository;

import com.example.todo.domain.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

/**
 * Spring Data repository for Todo entities.
 */
public interface TodoRepository extends JpaRepository<Todo, UUID>,
        JpaSpecificationExecutor<Todo> {
}
