import { Component, inject, signal, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { File } from '../../services/file';
import { Router } from '@angular/router';
import { Folder } from '../../services/folder';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private fileService = inject(File);
  protected auth = inject(Auth);
  private router = inject(Router);
  files = signal<any[]>([])
  private folderService = inject(Folder);
  currentFolderId = signal<number | null>(null);
  breadcrumbs = signal<{ id: number | null, name: string }[]>([{ id: null, name: 'Home' }]);
  folders = signal<any[]>([]);
  showWelcome = signal(true);
  fadingWelcome = signal(false);

  public ngOnInit() {
    setTimeout(() => this.fadingWelcome.set(true), 1500);
    setTimeout(() => this.showWelcome.set(false), 2000);
    this.fileService.getFiles().subscribe((data: any) => this.files.set(data));
    this.folderService.getFolders(this.currentFolderId()).subscribe((data: any) => this.folders.set(data));
  }

  async onUpload(files: FileList | null) {
    if (files && files[0]) {
      await this.fileService.upload(files[0]);
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
    this.folderService.createFolder(name, this.currentFolderId()).subscribe(() => this.ngOnInit());
  }
}
