package com.example.todo.service;

import com.example.todo.domain.*;
import com.example.todo.dto.*;
import com.example.todo.exception.*;
import com.example.todo.mapper.TodoMapper;
import com.example.todo.repository.*;
import jakarta.persistence.OptimisticLockException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.*;

import java.time.OffsetDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TodoServiceImplTest {

    @Mock
    private TodoRepository todoRepository;

    @Mock
    private TodoMapper todoMapper;

    @InjectMocks
    private TodoServiceImpl todoService;

    private final String mockUserId = UUID.randomUUID().toString();

    @BeforeEach
    void setUpSecurityContext() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(mockUserId);
        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(context);
    }

    @Test
    void createTodo_HappyPath() {
        // given
        TodoCreateDto createDto = TodoCreateDto.builder()
                .title("Test Todo")
                .description("Desc")
                .dueDate(OffsetDateTime.now().plusDays(1))
                .status(TodoStatus.IN_PROGRESS)
                .build();

        Todo entity = new Todo();
        entity.setTitle(createDto.getTitle());
        entity.setDescription(createDto.getDescription());
        entity.setDueDate(createDto.getDueDate());
        entity.setStatus(createDto.getStatus());

        Todo saved = new Todo();
        saved.setId(UUID.randomUUID());
        saved.setUserId(mockUserId);
        saved.setTitle(createDto.getTitle());
        saved.setDescription(createDto.getDescription());
        saved.setDueDate(createDto.getDueDate());
        saved.setStatus(createDto.getStatus());

        TodoResponseDto responseDto = TodoResponseDto.builder()
                .id(saved.getId())
                .userId(mockUserId)
                .title(saved.getTitle())
                .description(saved.getDescription())
                .dueDate(saved.getDueDate())
                .status(saved.getStatus())
                .build();

        when(todoMapper.toEntity(createDto)).thenReturn(entity);
        when(todoRepository.save(entity)).thenReturn(saved);
        when(todoMapper.toDto(saved)).thenReturn(responseDto);

        // when
        TodoResponseDto result = todoService.createTodo(createDto);

        // then
        assertThat(result).isEqualTo(responseDto);
        verify(todoMapper).toEntity(createDto);
        verify(todoRepository).save(entity);
        verify(todoMapper).toDto(saved);
        assertThat(entity.getUserId()).isEqualTo(mockUserId);
        assertThat(entity.getStatus()).isEqualTo(TodoStatus.IN_PROGRESS);
    }

    @Test
    void getTodoById_Found() {
        // given
        UUID id = UUID.randomUUID();
        Todo todo = new Todo();
        todo.setId(id);
        todo.setUserId(mockUserId);
        TodoResponseDto responseDto = TodoResponseDto.builder()
                .id(id)
                .userId(mockUserId)
                .build();

        when(todoRepository.findOne(argThat(spec ->
                // verify specification contains both userId and id
                spec.toPredicate(null, null, null) != null
        ))).thenReturn(Optional.of(todo));
        when(todoMapper.toDto(todo)).thenReturn(responseDto);

        // when
        TodoResponseDto result = todoService.getTodoById(id);

        // then
        assertThat(result).isEqualTo(responseDto);
    }

    @Test
    void getTodoById_NotFound() {
        // given
        UUID id = UUID.randomUUID();
        when(todoRepository.findOne(any())).thenReturn(Optional.empty());

        // when / then
        assertThatThrownBy(() -> todoService.getTodoById(id))
                .isInstanceOf(TodoNotFoundException.class)
                .hasMessageContaining(id.toString());
    }

    @Test
    void listTodos_NoFilters_ReturnsPagedResponse() {
        // given
        Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"));
        Todo todo1 = new Todo();
        todo1.setId(UUID.randomUUID());
        todo1.setUserId(mockUserId);
        Todo todo2 = new Todo();
        todo2.setId(UUID.randomUUID());
        todo2.setUserId(mockUserId);

        Page<Todo> page = new PageImpl<>(List.of(todo1, todo2), pageable, 2);

        TodoResponseDto dto1 = TodoResponseDto.builder().id(todo1.getId()).userId(mockUserId).build();
        TodoResponseDto dto2 = TodoResponseDto.builder().id(todo2.getId()).userId(mockUserId).build();

        when(todoRepository.findAll(any(), eq(pageable))).thenReturn(page);
        when(todoMapper.toDto(todo1)).thenReturn(dto1);
        when(todoMapper.toDto(todo2)).thenReturn(dto2);

        // when
        PagedResponseDto<TodoResponseDto> result = todoService.listTodos(null, null, pageable);

        // then
        assertThat(result.getContent()).containsExactly(dto1, dto2);
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getPageNumber()).isZero();
        assertThat(result.isLast()).isTrue();
    }

    @Test
    void listTodos_WithFilters() {
        // given
        Pageable pageable = PageRequest.of(0, 10);
        TodoStatus filterStatus = TodoStatus.COMPLETED;
        OffsetDateTime dueBefore = OffsetDateTime.now().plusDays(5);

        Todo todo = new Todo();
        todo.setId(UUID.randomUUID());
        todo.setUserId(mockUserId);
        todo.setStatus(filterStatus);
        todo.setDueDate(OffsetDateTime.now().plusDays(1));

        Page<Todo> page = new PageImpl<>(List.of(todo), pageable, 1);
        TodoResponseDto dto = TodoResponseDto.builder()
                .id(todo.getId())
                .userId(mockUserId)
                .status(filterStatus)
                .dueDate(todo.getDueDate())
                .build();

        when(todoRepository.findAll(any(), eq(pageable))).thenReturn(page);
        when(todoMapper.toDto(todo)).thenReturn(dto);

        // when
        PagedResponseDto<TodoResponseDto> result = todoService.listTodos(filterStatus, dueBefore, pageable);

        // then
        assertThat(result.getContent()).hasSize(1).first().isEqualTo(dto);
        // verify that the Specification contains both status and dueBefore predicates
        verify(todoRepository).findAll(argThat(spec -> spec != null), eq(pageable));
    }

    @Test
    void updateTodo_HappyPath() {
        // given
        UUID id = UUID.randomUUID();
        Todo existing = new Todo();
        existing.setId(id);
        existing.setUserId(mockUserId);
        existing.setVersion(0L);

        TodoUpdateDto updateDto = TodoUpdateDto.builder()
                .title("Updated Title")
                .status(TodoStatus.COMPLETED)
                .build();

        Todo saved = new Todo();
        saved.setId(id);
        saved.setUserId(mockUserId);
        saved.setTitle("Updated Title");
        saved.setStatus(TodoStatus.COMPLETED);
        saved.setVersion(1L);

        TodoResponseDto responseDto = TodoResponseDto.builder()
                .id(id)
                .userId(mockUserId)
                .title("Updated Title")
                .status(TodoStatus.COMPLETED)
                .version(1L)
                .build();

        when(todoRepository.findOne(any())).thenReturn(Optional.of(existing));
        // mapper updates entity in place, no return
        when(todoRepository.save(existing)).thenReturn(saved);
        when(todoMapper.toDto(saved)).thenReturn(responseDto);

        // when
        TodoResponseDto result = todoService.updateTodo(id, updateDto);

        // then
        assertThat(result).isEqualTo(responseDto);
        verify(todoMapper).updateEntityFromDto(eq(updateDto), eq(existing));
        verify(todoRepository).save(existing);
    }

    @Test
    void updateTodo_NotFound() {
        // given
        UUID id = UUID.randomUUID();
        when(todoRepository.findOne(any())).thenReturn(Optional.empty());

        TodoUpdateDto updateDto = new TodoUpdateDto();

        // when / then
        assertThatThrownBy(() -> todoService.updateTodo(id, updateDto))
                .isInstanceOf(TodoNotFoundException.class);
    }

    @Test
    void updateTodo_OptimisticLockFailure() {
        // given
        UUID id = UUID.randomUUID();
        Todo existing = new Todo();
        existing.setId(id);
        existing.setUserId(mockUserId);

        TodoUpdateDto updateDto = new TodoUpdateDto();

        when(todoRepository.findOne(any())).thenReturn(Optional.of(existing));
        when(todoRepository.save(existing)).thenThrow(OptimisticLockException.class);

        // when / then
        assertThatThrownBy(() -> todoService.updateTodo(id, updateDto))
                .isInstanceOf(TodoConflictException.class)
                .hasMessageContaining("Concurrent modification");
    }

    @Test
    void deleteTodo_HappyPath() {
        // given
        UUID id = UUID.randomUUID();
        Todo existing = new Todo();
        existing.setId(id);
        existing.setUserId(mockUserId);

        when(todoRepository.findOne(any())).thenReturn(Optional.of(existing));
        doNothing().when(todoRepository).delete(existing);

        // when
        todoService.deleteTodo(id);

        // then
        verify(todoRepository).delete(existing);
    }

    @Test
    void deleteTodo_NotFound() {
        // given
        UUID id = UUID.randomUUID();
        when(todoRepository.findOne(any())).thenReturn(Optional.empty());

        // when / then
        assertThatThrownBy(() -> todoService.deleteTodo(id))
                .isInstanceOf(TodoNotFoundException.class);
    }
}
