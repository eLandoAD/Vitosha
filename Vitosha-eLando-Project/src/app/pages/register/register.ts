import { Component, inject } from '@angular/core';
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

  async onRegister(email: string, username: string, password: string) {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const kek = await this.crypto.deriveKEK(password, salt);
    const dek = await this.crypto.generateDEK();
    const { wrappedDek, iv } = await this.crypto.wrapDEK(dek, kek);

    const saltB64 = btoa(String.fromCharCode(...salt));
    const ivB64 = btoa(String.fromCharCode(...new Uint8Array(iv)));
    const wrappedDekB64 = btoa(String.fromCharCode(...new Uint8Array(wrappedDek)));

    this.auth.register(email, username, password, saltB64, ivB64, wrappedDekB64).subscribe({
      next: () => this.router.navigate(['/verify']),
      error: (error) => console.log(error)
    });
  }
}
