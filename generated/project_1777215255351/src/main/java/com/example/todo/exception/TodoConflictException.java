package com.example.todo.exception;

/**
 * Exception indicating a conflict, e.g., optimistic lock failure.
 */
public class TodoConflictException extends RuntimeException {
    public TodoConflictException(String message) {
        super(message);
    }
}
