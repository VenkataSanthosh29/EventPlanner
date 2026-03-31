package com.edutech.config;

import com.edutech.jwt.JwtRequestFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;

    public SecurityConfig(JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .antMatchers("/api/user/register", "/api/user/login").permitAll()

                // Role-based access
                .antMatchers("/api/planner/**").hasRole("PLANNER")
                .antMatchers("/api/staff/**").hasRole("STAFF")
                .antMatchers("/api/client/**").hasRole("CLIENT")

                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtRequestFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    @Bean
public AuthenticationManager authenticationManager(
        AuthenticationConfiguration config) throws Exception {
    return config.getAuthenticationManager();
}

}