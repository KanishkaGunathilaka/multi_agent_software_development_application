package com.example.todo.util;

import org.springframework.data.domain.*;

import java.util.Optional;

/**
 * Helper to build a {@link Pageable} from optional page/size parameters.
 */
public final class PageRequestBuilder {

    private PageRequestBuilder() {
        // utility
    }

    /**
     * Creates a Pageable instance.
     *
     * @param page optional zero‑based page number, defaults to 0
     * @param size optional page size, defaults to 20, max 200
     * @param sort optional sort
     * @return Pageable
     */
    public static Pageable build(Optional<Integer> page,
                                 Optional<Integer> size,
                                 Sort sort) {
        int pageNumber = page.orElse(0);
        int pageSize = size.filter(s -> s > 0 && s <= 200).orElse(20);
        return PageRequest.of(pageNumber, pageSize, sort);
    }
}
