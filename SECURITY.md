# SecureVault — Security Design

## Overview

SecureVault implements true end-to-end encryption (E2EE). Files are encrypted in the browser before being uploaded and decrypted in the browser after being downloaded. The server stores only ciphertext and has no ability to decrypt any user data.

---

## Key Management Architecture

### The Problem
If the server could read encryption keys, it could read files. So the key must never leave the browser in plaintext.

### The Solution — KEK / DEK Split

We use a two-layer key architecture:

**KEK (Key Encryption Key)**
- Derived from the user's password using PBKDF2 with SHA-256 and 100,000 iterations
- Never stored anywhere — it exists only in browser memory while the user is logged in
- A random 16-byte salt is generated per user at registration and stored on the server

**DEK (Data Encryption Key)**
- A random 256-bit AES-GCM key generated once at registration
- This is the key that actually encrypts files
- The DEK is encrypted (wrapped) with the KEK using AES-GCM before being sent to the server
- The server stores only the encrypted DEK — it cannot decrypt it without the KEK

**File Encryption**
- Each file is encrypted with the DEK using AES-GCM 256-bit
- A unique random 12-byte IV is generated per file
- The IV is stored alongside the encrypted file and returned on download
- The server stores only ciphertext — never the original file bytes

---

## Encryption Flow

### Registration
1. User enters password
2. Browser generates a random 16-byte salt
3. Browser derives KEK from password + salt using PBKDF2 (100,000 iterations, SHA-256)
4. Browser generates a random DEK
5. Browser encrypts DEK with KEK using AES-GCM (produces wrapped DEK + IV)
6. Browser sends encrypted DEK + salt + IV to server
7. Server stores these — it cannot derive the KEK or decrypt the DEK

### Login
1. User enters password
2. Browser fetches encrypted DEK + salt + IV from server
3. Browser derives KEK from password + salt using PBKDF2
4. Browser decrypts DEK using KEK
5. DEK lives in memory — used to encrypt/decrypt files during the session

### File Upload
1. Browser reads file bytes
2. Browser generates a random 12-byte IV
3. Browser encrypts file bytes with DEK + IV using AES-GCM
4. Encrypted bytes are uploaded to server
5. IV is stored in the database alongside file metadata

### File Download
1. Browser requests encrypted file from server
2. Server returns encrypted bytes + IV in response header
3. Browser decrypts file using DEK + IV
4. Decrypted file is saved to disk — never sent back to server

---

## Password Reset — Two Flows

### Flow 1 — Forgot Password (user cannot remember password)
The KEK is derived from the password. Without the old password, the DEK cannot be decrypted. Therefore:
- A new random DEK is generated
- The old DEK is discarded
- All previously uploaded files become permanently inaccessible
- The user is warned clearly before proceeding

This is the honest and correct behavior of real E2EE. Signal and ProtonMail handle forgotten passwords the same way.

### Flow 2 — Change Password (user knows current password)
- User enters current password and new password
- Browser logs in with current password to retrieve encrypted DEK
- Browser decrypts DEK using old KEK
- Browser derives new KEK from new password
- Browser re-encrypts DEK under new KEK
- New encrypted DEK is sent to server
- All files remain accessible — only the DEK wrapper changes

---

## What the Server Sees

| Data | Server stores | Server can read |
|------|--------------|-----------------|
| Password | Bcrypt hash only | No |
| KEK | Never stored | No |
| DEK | Encrypted form only | No |
| File contents | Encrypted bytes only | No |
| File IV | Yes | Yes (needed for decryption, useless without DEK) |
| DEK salt | Yes | Yes (needed for key derivation, useless without password) |

---

## Libraries and Algorithms Used

| Purpose | Algorithm | Library |
|---------|-----------|---------|
| Key derivation | PBKDF2-SHA256, 100,000 iterations | Web Crypto API (browser built-in) |
| File encryption | AES-GCM 256-bit | Web Crypto API (browser built-in) |
| DEK wrapping | AES-GCM 256-bit | Web Crypto API (browser built-in) |
| Authentication | JWT (HS256) | jjwt (Spring Boot) |
| Password hashing | BCrypt | Spring Security |

No custom cryptography was implemented. All cryptographic operations use vetted, standardized algorithms via the browser's built-in Web Crypto API.

---

## Threat Model

**If the server is fully compromised:**
- Attacker sees encrypted DEK, salt, IV, encrypted file bytes
- Without the user's password, the KEK cannot be derived
- Without the KEK, the DEK cannot be decrypted
- Without the DEK, no files can be decrypted
- User data remains protected

**If the database is leaked:**
- Same as above — all sensitive data is encrypted

**If a user forgets their password:**
- Files encrypted under the old DEK are permanently inaccessible
- This is a fundamental and intentional property of E2EE