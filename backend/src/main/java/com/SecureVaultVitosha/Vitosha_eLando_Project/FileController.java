package com.SecureVaultVitosha.Vitosha_eLando_Project;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/files")
public class FileController {

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private UserRepository userRepository;

    private final Path storageDir = Paths.get("uploads");

    // UPLOAD
    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file,
                                     @RequestParam("email") String email) throws IOException {
        User owner = userRepository.findByEmail(email).orElse(null);
        if (owner == null) return ResponseEntity.badRequest().body("User not found");

        Files.createDirectories(storageDir);
        Path filePath = storageDir.resolve(System.currentTimeMillis() + "_" + file.getOriginalFilename());
        Files.write(filePath, file.getBytes());

        FileMetadata meta = new FileMetadata();
        meta.setOwner(owner);
        meta.setName(file.getOriginalFilename());
        meta.setPath(filePath.toString());
        meta.setSize(file.getSize());
        fileRepository.save(meta);

        return ResponseEntity.ok("File uploaded: " + file.getOriginalFilename());
    }

    // LIST
    @GetMapping("/list")
    public ResponseEntity<?> list(@RequestParam("email") String email) {
        User owner = userRepository.findByEmail(email).orElse(null);
        if (owner == null) return ResponseEntity.badRequest().body("User not found");
        List<FileMetadata> files = fileRepository.findByOwner(owner);
        return ResponseEntity.ok(files);
    }

    // DOWNLOAD
    @GetMapping("/download/{id}")
    public ResponseEntity<?> download(@PathVariable Long id) throws IOException {
        Optional<FileMetadata> metaOpt = fileRepository.findById(id);
        if (metaOpt.isEmpty()) return ResponseEntity.notFound().build();

        FileMetadata meta = metaOpt.get();
        Path filePath = Paths.get(meta.getPath());
        Resource resource = new UrlResource(filePath.toUri());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + meta.getName() + "\"")
                .body(resource);
    }

    // RENAME
    @PutMapping("/rename/{id}")
    public ResponseEntity<?> rename(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<FileMetadata> metaOpt = fileRepository.findById(id);
        if (metaOpt.isEmpty()) return ResponseEntity.notFound().build();

        FileMetadata meta = metaOpt.get();
        meta.setName(body.get("name"));
        fileRepository.save(meta);
        return ResponseEntity.ok("Renamed to: " + body.get("name"));
    }

    // DELETE
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) throws IOException {
        Optional<FileMetadata> metaOpt = fileRepository.findById(id);
        if (metaOpt.isEmpty()) return ResponseEntity.notFound().build();

        FileMetadata meta = metaOpt.get();
        Files.deleteIfExists(Paths.get(meta.getPath()));
        fileRepository.delete(meta);
        return ResponseEntity.ok("Deleted");
    }
}