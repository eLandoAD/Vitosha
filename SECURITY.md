# Security Design — SecureVault

## Key Management
1. KEK derived from password using PBKDF2
2. Random DEK generated
3. DEK encrypted with KEK
4. Only encrypted DEK stored on server

## Encryption
- Client-side AES-GCM
- Server never sees plaintext

## Password Reset
- Only DEK re-encrypted with new KEK
- Files NOT re-encrypted
