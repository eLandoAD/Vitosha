import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private auth = inject(Auth);
  private router = inject(Router);
  errorMessage = signal<string | null>(null);

  public onLogin(email: string, password: string) {
    this.auth.login(email, password).subscribe({
      next: (response: any) => {
        this.auth.setUsername(response.username);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        if (err.error === 'Invalid credentials') {
          this.errorMessage.set('Incorrect email or password.');
        } else if (err.error === 'Email not verified') {
          this.errorMessage.set('Please verify your email first.');
        } else {
          this.errorMessage.set('Something went wrong. Try again.');
        }
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

}
