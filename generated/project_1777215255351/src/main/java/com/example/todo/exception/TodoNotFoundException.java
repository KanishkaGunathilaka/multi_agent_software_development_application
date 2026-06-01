package com.example.todo.exception;

import java.util.UUID;

/**
 * Exception thrown when a Todo cannot be found.
 */
public class TodoNotFoundException extends RuntimeException {
    public TodoNotFoundException(UUID id) {
        super("Todo with id " + id + " not found");
    }
}
