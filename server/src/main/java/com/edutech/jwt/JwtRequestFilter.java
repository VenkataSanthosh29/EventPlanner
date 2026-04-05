package com.edutech.jwt;

import io.jsonwebtoken.Claims;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JwtRequestFilter(JwtUtil jwtUtil,
                            UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }


   @Override
protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
) throws ServletException, IOException {

String path = request.getRequestURI();
if (path.startsWith("/api/payments/razorpay/webhook") ||
    path.startsWith("/api/user/forgot-password") ||
    path.startsWith("/api/user/exists") ||
    path.equals("/api/user/login") ||
    path.equals("/api/user/register") ||
    path.equals("/api/user/send-otp") ||
    path.equals("/api/user/verify-otp")) {

    filterChain.doFilter(request, response);
    return;
}

    final String authHeader = request.getHeader("Authorization");
    String username = null;
    String jwt = null;

    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        jwt = authHeader.substring(7);
        try {
            username = jwtUtil.extractUsername(jwt);
        } catch (Exception ignored) {}
    }

    if (username != null &&
        SecurityContextHolder.getContext().getAuthentication() == null) {

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(username);

        if (jwtUtil.validateToken(jwt, userDetails)) {

            Claims claims = jwtUtil.extractAllClaims(jwt);
            String role = claims.get("role", String.class);

            List<GrantedAuthority> authorities =
                    List.of(new SimpleGrantedAuthority("ROLE_" + role));

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            authorities
                    );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request));

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);
        }
    }

    filterChain.doFilter(request, response);
}
}