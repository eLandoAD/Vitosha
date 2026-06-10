package com.SecureVaultVitosha.Vitosha_eLando_Project;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findByOwnerAndParentFolderIsNull(User owner);
    List<Folder> findByOwnerAndParentFolder(User owner, Folder parentFolder);
}