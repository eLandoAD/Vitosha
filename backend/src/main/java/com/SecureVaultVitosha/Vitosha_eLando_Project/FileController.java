package com.SecureVaultVitosha.Vitosha_eLando_Project;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/files")
public class FileController {

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final Path storageDir = Paths.get("uploads");

    private User getUserFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return null;
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email).orElse(null);
    }

    // UPLOAD
    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file,
            @RequestParam(value = "iv", required = false) String iv,
            @RequestParam(value = "folderId", required = false) Long folderId,
            @RequestHeader("Authorization") String authHeader) throws IOException {
        if (file.isEmpty())
            return ResponseEntity.badRequest().body("File is empty");

        User owner = getUserFromToken(authHeader);
        if (owner == null)
            return ResponseEntity.status(401).body("Unauthorized");

        Files.createDirectories(storageDir);
        Path filePath = storageDir.resolve(System.currentTimeMillis() + "_" + file.getOriginalFilename());
        Files.write(filePath, file.getBytes());

        FileMetadata meta = new FileMetadata();
        meta.setOwner(owner);
        meta.setName(file.getOriginalFilename());
        meta.setPath(filePath.toString());
        meta.setSize(file.getSize());
        meta.setFileIv(iv);

        if (folderId != null) {
            Folder folder = new Folder();
            folder.setId(folderId);
            meta.setFolder(folder);
        }

        fileRepository.save(meta);
        return ResponseEntity.status(201).body("File uploaded: " + file.getOriginalFilename());
    }

    // LIST
    @GetMapping
    public ResponseEntity<?> list(@RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Long folderId) {
        User owner = getUserFromToken(authHeader);
        if (owner == null)
            return ResponseEntity.status(401).body("Unauthorized");

        List<FileMetadata> files;
        if (folderId == null) {
            files = fileRepository.findByOwnerAndFolderIsNull(owner);
        } else {
            Folder folder = new Folder();
            folder.setId(folderId);
            files = fileRepository.findByOwnerAndFolder(owner, folder);
        }
        return ResponseEntity.ok(files);
    }

    // DOWNLOAD
    @GetMapping("/{id}")
    public ResponseEntity<?> download(@PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) throws IOException {
        User owner = getUserFromToken(authHeader);
        if (owner == null)
            return ResponseEntity.status(401).body("Unauthorized");

        Optional<FileMetadata> metaOpt = fileRepository.findById(id);
        if (metaOpt.isEmpty())
            return ResponseEntity.status(404).body("File not found");

        FileMetadata meta = metaOpt.get();
        Path filePath = Paths.get(meta.getPath());

        if (!Files.exists(filePath))
            return ResponseEntity.status(404).body("File not found on disk");

        Resource resource = new UrlResource(filePath.toUri());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + meta.getName() + "\"")
                .header("X-File-IV", meta.getFileIv() != null ? meta.getFileIv() : "")
                .header("Access-Control-Expose-Headers", "X-File-IV")
                .body(resource);
    }

    // RENAME
    @PutMapping("/rename/{id}")
    public ResponseEntity<?> rename(@PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader) {
        User owner = getUserFromToken(authHeader);
        if (owner == null)
            return ResponseEntity.status(401).body("Unauthorized");

        String newName = body.get("name");
        if (newName == null || newName.isBlank())
            return ResponseEntity.badRequest().body("Name is required");

        Optional<FileMetadata> metaOpt = fileRepository.findById(id);
        if (metaOpt.isEmpty())
            return ResponseEntity.status(404).body("File not found");

        FileMetadata meta = metaOpt.get();
        meta.setName(newName);
        fileRepository.save(meta);
        return ResponseEntity.ok("Renamed to: " + newName);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) throws IOException {
        User owner = getUserFromToken(authHeader);
        if (owner == null)
            return ResponseEntity.status(401).body("Unauthorized");

        Optional<FileMetadata> metaOpt = fileRepository.findById(id);
        if (metaOpt.isEmpty())
            return ResponseEntity.status(404).body("File not found");

        FileMetadata meta = metaOpt.get();
        Files.deleteIfExists(Paths.get(meta.getPath()));
        fileRepository.delete(meta);
        return ResponseEntity.ok("Deleted");
    }

    // MOVE
    @PutMapping("/{id}/move")
    public ResponseEntity<?> move(@PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @RequestHeader("Authorization") String authHeader) {
        User owner = getUserFromToken(authHeader);
        if (owner == null)
            return ResponseEntity.status(401).body("Unauthorized");

        Optional<FileMetadata> metaOpt = fileRepository.findById(id);
        if (metaOpt.isEmpty())
            return ResponseEntity.status(404).body("File not found");

        FileMetadata meta = metaOpt.get();
        Object folderIdObj = body.get("folderId");
        if (folderIdObj != null) {
            Folder folder = new Folder();
            folder.setId(Long.parseLong(folderIdObj.toString()));
            meta.setFolder(folder);
        } else {
            meta.setFolder(null);
        }
        fileRepository.save(meta);
        return ResponseEntity.ok("Moved");
    }
}