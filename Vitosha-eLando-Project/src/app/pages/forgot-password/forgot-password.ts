import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';


@Component({
  selector: 'app-forgot-password',
  imports: [],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {

  private http = inject(HttpClient);
  private router = inject(Router);
  resetLink = signal<string | null>(null);

  public onSubmit(email: string) {
    this.http.post<any>('http://localhost:8080/auth/forgot-password', { email }).subscribe({
      next: (response: any) => this.resetLink.set(response.resetLink),
      error: (err) => console.log(err)
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
