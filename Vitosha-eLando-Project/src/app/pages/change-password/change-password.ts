import { Component, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Crypto } from '../../services/crypto';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';


@Component({
  selector: 'app-change-password',
  imports: [],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword {
  private crypto = inject(Crypto);
  private auth = inject(Auth);
  private http = inject(HttpClient);
  private router = inject(Router);

  async onChangePassword(oldPassword: string, newPassword: string) {
    const loginResponse: any = await this.http.post(
      '/api/auth/login',
      { email: this.auth.getUsername(), password: oldPassword }
    ).toPromise();
    const salt = Uint8Array.from(atob(loginResponse.saltB64), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(loginResponse.ivB64), c => c.charCodeAt(0));
    const wrappedDek = Uint8Array.from(atob(loginResponse.wrappedDekB64), c => c.charCodeAt(0));
    const oldKek = await this.crypto.deriveKEK(oldPassword, salt);
    const dek = await this.crypto.unwrapDEK(wrappedDek.buffer, oldKek, iv);
    const newSalt = window.crypto.getRandomValues(new Uint8Array(16));
    const newKek = await this.crypto.deriveKEK(newPassword, newSalt);
    const { wrappedDek: newWrappedDek, iv: newIv } = await this.crypto.wrapDEK(dek, newKek);
    const newSaltB64 = btoa(String.fromCharCode(...newSalt));
    const newIvB64 = btoa(String.fromCharCode(...new Uint8Array(newIv)));
    const newWrappedDekB64 = btoa(String.fromCharCode(...new Uint8Array(newWrappedDek)));
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.auth.getToken() });
    this.http.post('/api/auth/change-password', {
      newPassword,
      newSaltB64,
      newIvB64,
      newWrappedDekB64
    }, { headers }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        if (err.status === 200) this.router.navigate(['/dashboard']);
        else console.log(err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
