import { Component, inject, signal, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { File } from '../../services/file';
import { Router } from '@angular/router';
import { Folder } from '../../services/folder';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private fileService = inject(File);
  protected auth = inject(Auth);
  private router = inject(Router);
  sortBy = signal<'name' | 'size' | 'date'>('name');
  files = signal<any[]>([])
  private folderService = inject(Folder);
  currentFolderId = signal<number | null>(null);
  breadcrumbs = signal<{ id: number | null, name: string }[]>([{ id: null, name: 'Home' }]);
  folders = signal<any[]>([]);
  showWelcome = signal(true);
  searchQuery = signal<string>('');
  renamingFileId = signal<number | null>(null);
  renamingFolderId = signal<number | null>(null);
  uploading = signal(false);
  fadingWelcome = signal(false);
  selectedFileName = signal<string>('No file chosen');

  ngOnInit() {
    setTimeout(() => this.showWelcome.set(false), 2000);
    window.onpopstate = (event) => {
      if (this.breadcrumbs().length > 1) {
        this.navigateTo(this.breadcrumbs().length - 2);

      }
    };

    this.fileService.getFiles(this.currentFolderId()).subscribe((data: any) => this.files.set(data));
    this.folderService.getFolders(this.currentFolderId()).subscribe((data: any) => this.folders.set(data));
  }

  async onUpload(files: FileList | null) {
    if (files && files[0]) {
      this.uploading.set(true);
      try {
        await this.fileService.upload(files[0], this.currentFolderId());
      } catch (err: any) {
        if (err.status !== 201) {
          this.uploading.set(false);
          return;
        }
      }
      this.uploading.set(false);
      this.selectedFileName.set('No file chosen');
      const fileInput = document.querySelector('input[type=file]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      this.ngOnInit();
    }
  }

  public onLogout() {
    this.auth.logout()
    this.router.navigate(['/login'])
  }

  openFolder(folder: any) {
    this.currentFolderId.set(folder.id);
    this.breadcrumbs.update(b => [...b, { id: folder.id, name: folder.name }]);
    this.ngOnInit();
  }

  navigateTo(index: number) {
    const crumb = this.breadcrumbs()[index];
    this.currentFolderId.set(crumb.id);
    this.breadcrumbs.update(b => b.slice(0, index + 1));
    this.ngOnInit();
  }

  createFolder(name: string) {
    if (!name || name.trim() === '') return;
    this.folderService.createFolder(name.trim(), this.currentFolderId()).subscribe({
      next: () => this.ngOnInit(),
      error: (err) => {
        if (err.status === 200) this.ngOnInit();
      }
    });
  }

  onDownload(fileId: number, fileName: string) {
    this.fileService.download(fileId, fileName);
  }

  onFileSelected(input: HTMLInputElement) {
    if (input.files && input.files[0]) {
      this.selectedFileName.set(input.files[0].name);
    }
  }

  onDeleteFolder(folderId: number) {
    if (!confirm('Delete this folder? This cannot be undone.')) return;
    this.folderService.deleteFolder(folderId).subscribe({
      next: () => this.ngOnInit(),
      error: (err) => {
        if (err.status === 200) this.ngOnInit();
      }
    });
  }

  onDeleteFile(fileId: number) {
    if (!confirm('Delete this file? This cannot be undone.')) return;
    this.fileService.delete(fileId).subscribe({
      next: () => this.ngOnInit(),
      error: (err) => {
        if (err.status === 200) this.ngOnInit();
      }
    });
  }

  onDragStart(event: DragEvent, fileId: number) {
    event.dataTransfer?.setData('fileId', fileId.toString());
  }

  onDrop(event: DragEvent, folderId: number) {
    event.preventDefault();
    const fileId = event.dataTransfer?.getData('fileId');
    if (fileId) {
      this.folderService.moveFile(Number(fileId), folderId).subscribe({
        next: () => this.ngOnInit(),
        error: (err) => {
          if (err.status === 200) this.ngOnInit();
        }
      });
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  goToChangePassword() {
    this.router.navigate(['/change-password']);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getFileIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return '⬜';
    if (['mp4', 'mov', 'avi', 'mkv'].includes(ext || '')) return '▶';
    if (['mp3', 'wav', 'flac'].includes(ext || '')) return '♪';
    if (['zip', 'rar', '7z'].includes(ext || '')) return '⊞';
    if (['doc', 'docx', 'txt', 'md', 'pdf'].includes(ext || '')) return '≡';
    if (['js', 'ts', 'py', 'java', 'html', 'css'].includes(ext || '')) return '{ }';
    return '○';
  }

  getFilteredAndSortedFiles() {
    return [...this.files()]
      .filter(f => f.name.toLowerCase().includes(this.searchQuery().toLowerCase()))
      .sort((a, b) => {
        if (this.sortBy() === 'name') return a.name.localeCompare(b.name);
        if (this.sortBy() === 'size') return a.size - b.size;
        if (this.sortBy() === 'date') return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        return 0;
      });
  }

  getFilteredFolders() {
    return this.folders().filter(f =>
      f.name.toLowerCase().includes(this.searchQuery().toLowerCase())
    );
  }

  renameFile(fileId: number, newName: string) {
    if (!newName.trim()) return;
    this.fileService.renameFile(fileId, newName.trim()).subscribe({
      next: () => { this.renamingFileId.set(null); this.ngOnInit(); },
      error: (err) => { if (err.status === 200) { this.renamingFileId.set(null); this.ngOnInit(); } }
    });
  }

  renameFolder(folderId: number, newName: string) {
    if (!newName.trim()) return;
    this.folderService.renameFolder(folderId, newName.trim()).subscribe({
      next: () => { this.renamingFolderId.set(null); this.ngOnInit(); },
      error: (err) => { if (err.status === 200) { this.renamingFolderId.set(null); this.ngOnInit(); } }
    });
  }
}
