package com.SecureVaultVitosha.Vitosha_eLando_Project;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/folders")
public class FolderController {

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileRepository fileRepository;

    // CREATE
    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        User owner = userRepository.findByEmail(body.get("email")).orElse(null);
        if (owner == null) return ResponseEntity.badRequest().body("User not found");

        Folder folder = new Folder();
        folder.setOwner(owner);
        folder.setName(body.get("name"));

        if (body.get("parentFolderId") != null) {
            folderRepository.findById(Long.parseLong(body.get("parentFolderId")))
                    .ifPresent(folder::setParentFolder);
        }

        folderRepository.save(folder);
        return ResponseEntity.ok("Folder created: " + folder.getName());
    }

    // RENAME
    @PutMapping("/rename/{id}")
    public ResponseEntity<?> rename(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Folder> folderOpt = folderRepository.findById(id);
        if (folderOpt.isEmpty()) return ResponseEntity.notFound().build();

        Folder folder = folderOpt.get();
        folder.setName(body.get("name"));
        folderRepository.save(folder);
        return ResponseEntity.ok("Renamed to: " + body.get("name"));
    }

    // DELETE
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Optional<Folder> folderOpt = folderRepository.findById(id);
        if (folderOpt.isEmpty()) return ResponseEntity.notFound().build();
        folderRepository.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }

    // LIST CONTENTS
    @GetMapping("/contents")
    public ResponseEntity<?> contents(@RequestParam String email,
                                       @RequestParam(required = false) Long folderId) {
        User owner = userRepository.findByEmail(email).orElse(null);
        if (owner == null) return ResponseEntity.badRequest().body("User not found");

        List<Folder> subfolders;
        List<FileMetadata> files;

        if (folderId == null) {
            subfolders = folderRepository.findByOwnerAndParentFolderIsNull(owner);
            files = fileRepository.findByOwnerAndFolderIsNull(owner);
        } else {
            Folder folder = folderRepository.findById(folderId).orElse(null);
            if (folder == null) return ResponseEntity.notFound().build();
            subfolders = folderRepository.findByOwnerAndParentFolder(owner, folder);
            files = fileRepository.findByOwnerAndFolder(owner, folder);
        }

        return ResponseEntity.ok(Map.of("folders", subfolders, "files", files));
    }

    // MOVE FILE TO FOLDER
    @PutMapping("/move-file/{fileId}")
    public ResponseEntity<?> moveFile(@PathVariable Long fileId,
                                       @RequestBody Map<String, String> body) {
        Optional<FileMetadata> fileOpt = fileRepository.findById(fileId);
        if (fileOpt.isEmpty()) return ResponseEntity.notFound().build();

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