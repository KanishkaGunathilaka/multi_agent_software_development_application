package com.example.todo.dto;

import lombok.*;

import java.util.List;

/**
 * Generic pagination envelope.
 *
 * @param <T> type of content items
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagedResponseDto<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;
}
