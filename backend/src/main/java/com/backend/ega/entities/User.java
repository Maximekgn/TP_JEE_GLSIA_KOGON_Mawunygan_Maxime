package com.backend.ega.entities;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.List;

public class User implements UserDetails {

    private final BaseUser user;
    private final String role;

    public User(BaseUser user) {
        this.user = user;
        if (user instanceof Admin) {
            this.role = "ROLE_ADMIN";
        } else {
            this.role = "ROLE_CLIENT";
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.isActive();
    }

    public BaseUser getUser() {
        return user;
    }

    public String getRole() {
        return role;
    }
}