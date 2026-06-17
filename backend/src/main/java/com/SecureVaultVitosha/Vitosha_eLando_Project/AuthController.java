package com.SecureVaultVitosha.Vitosha_eLando_Project;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    private ResetTokenRepository resetTokenRepository;

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String saltB64 = body.get("saltB64");
        String ivB64 = body.get("ivB64");
        String wrappedDekB64 = body.get("wrappedDekB64");
        String username = body.get("username");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        if (password == null || password.length() < 6) {
            return ResponseEntity.badRequest().body("Password must be at least 6 characters");
        }
        if (!email.contains("@")) {
            return ResponseEntity.badRequest().body("Invalid email format");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(409).body("Email already in use");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setDekSalt(saltB64);
        user.setDekIv(ivB64);
        user.setEncryptedDek(wrappedDekB64);
        userRepository.save(user);

        System.out.println("Verify link: /api/auth/verify?token=" + user.getVerificationToken());
        return ResponseEntity.status(201)
                .body(Map.of("verifyLink", "/api/auth/verify?token=" + user.getVerificationToken()));
    }

    // VERIFY EMAIL
    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam String token) {
        Optional<User> userOpt = userRepository.findByVerificationToken(token);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid token");
        }
        User user = userOpt.get();
        user.setVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
        return ResponseEntity.status(302)
                .header("Location", "/login")
                .build();
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        if (!user.isVerified()) {
            return ResponseEntity.status(403).body("Email not verified");
        }

        String token = jwtUtil.generateToken(email);
        return ResponseEntity.ok(Map.of(
                "username", user.getUsername() != null ? user.getUsername() : user.getEmail(),
                "token", token,
                "email", user.getEmail(),
                "saltB64", user.getDekSalt() != null ? user.getDekSalt() : "",
                "ivB64", user.getDekIv() != null ? user.getDekIv() : "",
                "wrappedDekB64", user.getEncryptedDek() != null ? user.getEncryptedDek() : ""));
    }

    // SEND RESET LINK
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty())
            return ResponseEntity.badRequest().body("User not found");

        User user = userOpt.get();
        ResetToken resetToken = new ResetToken();
        resetToken.setToken(UUID.randomUUID().toString());
        resetToken.setUser(user);
        resetToken.setExpiresAt(LocalDateTime.now().plusHours(1));
        resetTokenRepository.save(resetToken);

        System.out.println("Reset link: /reset-password?token=" + resetToken.getToken());
        return ResponseEntity
                .ok(Map.of("resetLink", "/reset-password?token=" + resetToken.getToken()));
    }

    // RESET PASSWORD (forgot - files deleted)
    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");
        String newSaltB64 = body.get("newSaltB64");
        String newIvB64 = body.get("newIvB64");
        String newWrappedDekB64 = body.get("newWrappedDekB64");

        Optional<ResetToken> tokenOpt = resetTokenRepository.findByToken(token);
        if (tokenOpt.isEmpty())
            return ResponseEntity.badRequest().body("Invalid token");

        ResetToken resetToken = tokenOpt.get();
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Token expired");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setEncryptedDek(newWrappedDekB64);
        user.setDekSalt(newSaltB64);
        user.setDekIv(newIvB64);
        userRepository.save(user);

        resetTokenRepository.deleteByUser(user);
        return ResponseEntity.ok("Password reset successful");
    }

    // CHANGE PASSWORD (logged in - files preserved)
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return ResponseEntity.status(401).body("Unauthorized");

        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty())
            return ResponseEntity.status(404).body("User not found");

        User user = userOpt.get();
        user.setPasswordHash(passwordEncoder.encode(body.get("newPassword")));
        user.setEncryptedDek(body.get("newWrappedDekB64"));
        user.setDekSalt(body.get("newSaltB64"));
        user.setDekIv(body.get("newIvB64"));
        userRepository.save(user);

        return ResponseEntity.ok("Password changed successfully");
    }
}