package com.example.todo.mapper;

import com.example.todo.dto.TodoCreateDto;
import com.example.todo.dto.TodoResponseDto;
import com.example.todo.dto.TodoUpdateDto;
import com.example.todo.domain.Todo;
import org.mapstruct.*;

import java.util.UUID;

/**
 * MapStruct mapper for converting between Todo entity and DTOs.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TodoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    Todo toEntity(TodoCreateDto dto);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "userId", source = "userId")
    TodoResponseDto toDto(Todo entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntityFromDto(TodoUpdateDto dto, @MappingTarget Todo entity);
}
