import { Component, inject, signal, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { File } from '../../services/file';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private fileService = inject(File);
  private auth = inject(Auth);
  private router = inject(Router);
  files = signal<any[]>([])

  public ngOnInit() {
    this.fileService.getFiles().subscribe((data: any) => this.files.set(data))
  }

  public onUpload(files: FileList | null) {
    if (files && files[0]) {
      this.fileService.upload(files[0]).subscribe(() => this.ngOnInit());
    }
  }

  public onLogout(){
    this.auth.logout()
    this.router.navigate(['/login'])
  }
}
