package com.SecureVaultVitosha.Vitosha_eLando_Project;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private boolean verified = false;

    private String verificationToken;

    private String username;
    private String encryptedDek;
    private String dekSalt;
    private String dekIv;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public String getEncryptedDek() {
        return encryptedDek;
    }

    public void setEncryptedDek(String encryptedDek) {
        this.encryptedDek = encryptedDek;
    }

    public String getDekSalt() {
        return dekSalt;
    }

    public void setDekSalt(String dekSalt) {
        this.dekSalt = dekSalt;
    }

    public String getDekIv() {
        return dekIv;
    }

    public void setDekIv(String dekIv) {
        this.dekIv = dekIv;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getVerificationToken() {
        return verificationToken;
    }

    public void setVerificationToken(String verificationToken) {
        this.verificationToken = verificationToken;
    }
}