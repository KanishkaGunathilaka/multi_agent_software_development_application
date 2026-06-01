package com.example.todo.repository;

import com.example.todo.domain.Todo;
import com.example.todo.domain.TodoStatus;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.OffsetDateTime;

/**
 * Helper class to build dynamic JPA specifications for Todo filtering.
 */
public final class TodoSpecification {

    private TodoSpecification() {
        // utility
    }

    public static Specification<Todo> belongsToUser(String userId) {
        return (root, query, cb) -> cb.equal(root.get("userId"), userId);
    }

    public static Specification<Todo> hasStatus(TodoStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Todo> dueBefore(OffsetDateTime dateTime) {
        return (root, query, cb) -> cb.lessThan(root.get("dueDate"), dateTime);
    }
}
