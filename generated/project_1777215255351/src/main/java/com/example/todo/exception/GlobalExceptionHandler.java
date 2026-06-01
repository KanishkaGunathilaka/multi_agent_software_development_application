package com.example.todo.exception;

import com.example.todo.dto.ErrorResponseDto;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.*;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.OffsetDateTime;

/**
 * Centralized exception handling that produces RFC‑7807 problem details.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(TodoNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleNotFound(TodoNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage());
    }

    @ExceptionHandler(TodoConflictException.class)
    public ResponseEntity<ErrorResponseDto> handleConflict(TodoConflictException ex) {
        return buildResponse(HttpStatus.CONFLICT, "Conflict", ex.getMessage());
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, ConstraintViolationException.class})
    public ResponseEntity<ErrorResponseDto> handleValidation(Exception ex) {
        String detail = ex.getMessage();
        return buildResponse(HttpStatus.BAD_REQUEST, "Validation Error", detail);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGeneral(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", ex.getMessage());
    }

    private ResponseEntity<ErrorResponseDto> buildResponse(HttpStatus status,
                                                          String title,
                                                          String detail) {
        ErrorResponseDto body = ErrorResponseDto.builder()
                .type("about:blank")
                .title(title)
                .status(status.value())
                .detail(detail)
                .timestamp(OffsetDateTime.now())
                .build();
        return new ResponseEntity<>(body, new HttpHeaders(), status);
    }
}
