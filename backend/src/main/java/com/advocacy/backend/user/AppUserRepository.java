package com.advocacy.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByGoogleSubject(String googleSubject);

    Optional<AppUser> findByEmail(String email);

    boolean existsByEmail(String email);
}