import { Component, inject, signal } from '@angular/core';
import { Crypto } from '../../services/crypto';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private auth = inject(Auth);
  private router = inject(Router);
  private crypto = inject(Crypto);
  private verifyLink: string | null = null;
  errorMessage = signal<string | null>(null);

  async onRegister(email: string, username: string, password: string) {
    if (!email.includes('@')) {
      this.errorMessage.set('Please enter a valid email address.');
      return;
    }
    const passwordError = this.validatePassword(password);
    if (passwordError) {
      this.errorMessage.set(passwordError);
      return;
    }

    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const kek = await this.crypto.deriveKEK(password, salt);
    const dek = await this.crypto.generateDEK();
    const { wrappedDek, iv } = await this.crypto.wrapDEK(dek, kek);

    const saltB64 = btoa(String.fromCharCode(...salt));
    const ivB64 = btoa(String.fromCharCode(...new Uint8Array(iv)));
    const wrappedDekB64 = btoa(String.fromCharCode(...new Uint8Array(wrappedDek)));

    this.auth.register(email, username, password, saltB64, ivB64, wrappedDekB64).subscribe({
      next: (response: any) => {
        this.auth.setVerifyLink(response.verifyLink);
        this.router.navigate(['/verify-email']);
      },
      error: (err) => {
        if (err.status === 201) {
          this.auth.setVerifyLink(err.error?.verifyLink);
          this.router.navigate(['/verify-email']);
        } else if (err.status === 409) {
          this.errorMessage.set('Email already in use.');
        } else {
          this.errorMessage.set('Something went wrong. Try again.');
        }
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  setVerifyLink(link: string) {
    this.verifyLink = link;
  }

  getVerifyLink() {
    return this.verifyLink;
  }

  validatePassword(password: string): string | null {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return null;
  }
}
