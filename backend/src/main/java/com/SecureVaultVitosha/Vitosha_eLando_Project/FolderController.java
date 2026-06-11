package com.SecureVaultVitosha.Vitosha_eLando_Project;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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

@RestController
@RequestMapping("/folders")
public class FolderController {

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private User getUserFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return null;
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email).orElse(null);
    }

    // CREATE
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body,
            @RequestHeader("Authorization") String authHeader) {
        User owner = getUserFromToken(authHeader);
        if (owner == null)
            return ResponseEntity.status(401).body("Unauthorized");

        Folder folder = new Folder();
        folder.setOwner(owner);
        folder.setName((String) body.get("name"));

        Object parentId = body.get("parentId");
        if (parentId != null) {
            folderRepository.findById(Long.parseLong(parentId.toString()))
                    .ifPresent(folder::setParentFolder);
        }

        folderRepository.save(folder);
        return ResponseEntity.ok(Map.of("message", "Folder created", "name", folder.getName()));
    }

    // RENAME
    @PutMapping("/{id}")
    public ResponseEntity<?> rename(@PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader) {
        User owner = getUserFromToken(authHeader);
        if (owner == null)
            return ResponseEntity.status(401).body("Unauthorized");

        Optional<Folder> folderOpt = folderRepository.findById(id);
        if (folderOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Folder folder = folderOpt.get();
        folder.setName(body.get("name"));
        folderRepository.save(folder);
        return ResponseEntity.ok("Renamed to: " + body.get("name"));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        User owner = getUserFromToken(authHeader);
        if (owner == null)
            return ResponseEntity.status(401).body("Unauthorized");

        Optional<Folder> folderOpt = folderRepository.findById(id);
        if (folderOpt.isEmpty())
            return ResponseEntity.notFound().build();
        folderRepository.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }

    // LIST
    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false) Long parentId,
            @RequestHeader("Authorization") String authHeader) {
        User owner = getUserFromToken(authHeader);
        if (owner == null)
            return ResponseEntity.status(401).body("Unauthorized");

        List<Folder> subfolders;
        if (parentId == null) {
            subfolders = folderRepository.findByOwnerAndParentFolderIsNull(owner);
        } else {
            Folder parent = folderRepository.findById(parentId).orElse(null);
            if (parent == null)
                return ResponseEntity.notFound().build();
            subfolders = folderRepository.findByOwnerAndParentFolder(owner, parent);
        }

        List<Map<String, Object>> result = subfolders.stream().map(folder -> {
            long fileCount = fileRepository.findByOwnerAndFolder(owner, folder).size();
            return Map.<String, Object>of(
                    "id", folder.getId(),
                    "name", folder.getName(),
                    "fileCount", fileCount);
        }).toList();

        return ResponseEntity.ok(result);
    }

    // MOVE FILE TO FOLDER
    @PutMapping("/move-file/{fileId}")
    public ResponseEntity<?> moveFile(@PathVariable Long fileId,
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader) {
        User owner = getUserFromToken(authHeader);
        if (owner == null)
            return ResponseEntity.status(401).body("Unauthorized");

        Optional<FileMetadata> fileOpt = fileRepository.findById(fileId);
        if (fileOpt.isEmpty())
            return ResponseEntity.notFound().build();

        FileMetadata file = fileOpt.get();
        if (body.get("folderId") == null) {
            file.setFolder(null);
        } else {
            folderRepository.findById(Long.parseLong(body.get("folderId")))
                    .ifPresent(file::setFolder);
        }

        fileRepository.save(file);
        return ResponseEntity.ok("File moved");
    }
}