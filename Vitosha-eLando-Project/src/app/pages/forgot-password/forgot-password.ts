import { Component, inject } from '@angular/core';
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

  public onSubmit(email: string) {
    this.http.post('http://localhost:8080/api/auth/forgot-password', { email }).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (error) => console.log(error)
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
