package com.example.todo.mapper;

import com.example.todo.domain.Todo;
import com.example.todo.dto.TodoCreateDto;
import com.example.todo.dto.TodoResponseDto;
import com.example.todo.dto.TodoUpdateDto;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-26T23:07:40+0800",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.5 (Eclipse Adoptium)"
)
@Component
public class TodoMapperImpl implements TodoMapper {

    @Override
    public Todo toEntity(TodoCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        Todo.TodoBuilder todo = Todo.builder();

        todo.title( dto.getTitle() );
        todo.description( dto.getDescription() );
        todo.dueDate( dto.getDueDate() );
        todo.status( dto.getStatus() );

        return todo.build();
    }

    @Override
    public TodoResponseDto toDto(Todo entity) {
        if ( entity == null ) {
            return null;
        }

        TodoResponseDto.TodoResponseDtoBuilder todoResponseDto = TodoResponseDto.builder();

        todoResponseDto.id( entity.getId() );
        todoResponseDto.userId( entity.getUserId() );
        todoResponseDto.title( entity.getTitle() );
        todoResponseDto.description( entity.getDescription() );
        todoResponseDto.dueDate( entity.getDueDate() );
        todoResponseDto.status( entity.getStatus() );
        todoResponseDto.createdAt( entity.getCreatedAt() );
        todoResponseDto.updatedAt( entity.getUpdatedAt() );
        todoResponseDto.version( entity.getVersion() );

        return todoResponseDto.build();
    }

    @Override
    public void updateEntityFromDto(TodoUpdateDto dto, Todo entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getTitle() != null ) {
            entity.setTitle( dto.getTitle() );
        }
        if ( dto.getDescription() != null ) {
            entity.setDescription( dto.getDescription() );
        }
        if ( dto.getDueDate() != null ) {
            entity.setDueDate( dto.getDueDate() );
        }
        if ( dto.getStatus() != null ) {
            entity.setStatus( dto.getStatus() );
        }
    }
}
