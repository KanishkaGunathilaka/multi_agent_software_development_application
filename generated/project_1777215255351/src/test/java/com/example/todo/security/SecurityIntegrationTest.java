package com.example.todo.security;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.*;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.*;
import org.springframework.test.web.servlet.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Test
    void missingToken_Returns401() throws Exception {
        mockMvc.perform(get("/api/todos"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void malformedToken_Returns403() throws Exception {
        mockMvc.perform(get("/api/todos")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer malformed.token.here"))
                .andExpect(status().isForbidden());
    }

    @Test
    void expiredToken_Returns403() throws Exception {
        // Create a token with negative expiration to simulate expiry
        String expiredToken = Jwts.builder()
                .setSubject("expired-user")
                .setIssuedAt(java.util.Date.from(java.time.Instant.now().minusSeconds(3600)))
                .setExpiration(java.util.Date.from(java.time.Instant.now().minusSeconds(1800)))
                .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor("verysecretkeychangeme".getBytes()))
                .compact();

        mockMvc.perform(get("/api/todos")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void validToken_AllowsAccess() throws Exception {
        String token = tokenProvider.createToken("valid-user");
        mockMvc.perform(get("/api/todos")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk()); // 200 OK with empty list is acceptable
    }
}
