package com.example.todo.dto;

import lombok.*;

import java.time.OffsetDateTime;

/**
 * DTO compliant with RFC 7807 Problem Details.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponseDto {
    private String type;
    private String title;
    private int status;
    private String detail;
    private String instance;
    private OffsetDateTime timestamp;
}
