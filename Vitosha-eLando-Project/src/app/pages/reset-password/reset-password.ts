import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Crypto } from '../../services/crypto';
import { Auth } from '../../services/auth';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {

  private crypto = inject(Crypto);
  private auth = inject(Auth);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  async onReset(oldPassword: string, newPassword: string) {
    const token = this.route.snapshot.queryParams['token'];
    const response: any = await this.http.get('http://localhost:8080/api/auth/reset-data?token=' + token).toPromise();
    const salt = Uint8Array.from(atob(response.saltB64), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(response.ivB64), c => c.charCodeAt(0));
    const wrappedDek = Uint8Array.from(atob(response.wrappedDekB64), c => c.charCodeAt(0));
    const oldKek = await this.crypto.deriveKEK(oldPassword, salt);
    const dek = await this.crypto.unwrapDEK(wrappedDek.buffer, oldKek, iv);
    const newSalt = window.crypto.getRandomValues(new Uint8Array(16));
    const newKek = await this.crypto.deriveKEK(newPassword, newSalt);
    const { wrappedDek: newWrappedDek, iv: newIv } = await this.crypto.wrapDEK(dek, newKek);
    const newSaltB64 = btoa(String.fromCharCode(...newSalt));
    const newIvB64 = btoa(String.fromCharCode(...new Uint8Array(newIv)));
    const newWrappedDekB64 = btoa(String.fromCharCode(...new Uint8Array(newWrappedDek)));
    this.http.post('http://localhost:8080/api/auth/reset-password', { token, newPassword, newSaltB64, newIvB64, newWrappedDekB64 }).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (error) => console.log(error)
    });
  }
}
