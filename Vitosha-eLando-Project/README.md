# SecureVault — Encrypted File Storage

A web application for storing files securely with end-to-end encryption (E2EE). The server never reads file contents — files are encrypted in the browser before upload and decrypted only after download.

## Team
| Role | Person | Responsibilities |
|------|--------|-----------------|
| Person A | Backend | Spring Boot, MySQL, REST API, JWT |
| Person B | Frontend | Angular, UI, Web Crypto API |
| Person C | Integration | Testing, Docs, Git, Blocker handler |

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend | Java + Spring Boot |
| Frontend | Angular + Tailwind CSS |
| Database | MySQL |
| Encryption | Web Crypto API (AES-GCM, PBKDF2) |

## How to run

### Prerequisites
- Java 21+
- Node.js 18+
- MySQL

### Backend
```bash
cd backend
sudo service mysql start
./mvnw spring-boot:run
```
Runs on `http://localhost:8080`

### Frontend
```bash
cd Vitosha-eLando-Project
npm install
ng serve
```
Open the browser at `http://localhost:4200`

## Project Status
- [x] Phase 1 — Project skeleton
- [x] Phase 2 — Authentication
- [x] Phase 3 — File storage
- [x] Phase 4 — Encryption
- [x] Phase 5 — Folders
- [x] Phase 6 — Password reset

## Security
See [SECURITY.md](./SECURITY.md) for the full encryption and key management design.