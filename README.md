# SecureVault

Encrypted file storage. Files are encrypted in your browser before they leave — the server only ever sees ciphertext.

Built with Spring Boot, Angular, and MySQL. Encryption uses the browser's Web Crypto API (AES-GCM, PBKDF2). No custom crypto.

---

## Stack

- **Backend** — Java 17, Spring Boot 3.2
- **Frontend** — Angular 22, Tailwind CSS
- **Database** — MySQL 8.0
- **Crypto** — Web Crypto API (browser native)

---

## Setup

### Requirements

- Java 17+
- Node.js 18+
- MySQL 8.0
- npm

### Database

Open MySQL CLI and run:

```sql
CREATE DATABASE elando_db;
```

### Backend

Go into the backend folder, open `src/main/resources/application.properties` and set your MySQL root password:

```bash
spring.datasource.password=your_password_here
```


Then start it:

```bash
./mvnw spring-boot:run
```

Runs on port 8080.

### Frontend

```bash
cd Vitosha-eLando-Project
npm install
ng serve
```

Runs on port 4200.

---

## How it works

Register at `/register`. After submitting, a verification link appears on screen — click it. Then log in.

Files are encrypted client-side before upload using AES-GCM. On download they're decrypted in the browser. The server has no way to read them.

Folders work as expected. Drag files onto folders to move them. Double-click names to rename.

Two password flows:
- **Forgot password** — generates a new encryption key. Old files are gone. There's no way around this with real E2EE.
- **Change password** — re-wraps your existing key under the new password. Files stay intact.

---

## State of the project

Done: registration, login, E2EE upload/download, folders, rename, delete, drag and drop, search, sort, password reset, change password.

Not done: actual email sending (links appear on screen instead), file sharing, file previews.

Given more time: real email service, sharing encrypted files between users (hard — requires key exchange), in-browser previews for images and text files.