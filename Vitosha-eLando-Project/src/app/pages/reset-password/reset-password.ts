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

  async onReset(newPassword: string) {
    const token = this.route.snapshot.queryParams['token'];
    const newSalt = window.crypto.getRandomValues(new Uint8Array(16));
    const newKek = await this.crypto.deriveKEK(newPassword, newSalt);
    const newDek = await this.crypto.generateDEK();
    const { wrappedDek: newWrappedDek, iv: newIv } = await this.crypto.wrapDEK(newDek, newKek);
    const newSaltB64 = btoa(String.fromCharCode(...newSalt));
    const newIvB64 = btoa(String.fromCharCode(...new Uint8Array(newIv)));
    const newWrappedDekB64 = btoa(String.fromCharCode(...new Uint8Array(newWrappedDek)));
    this.http.post('/api/auth/reset-password', { token, newPassword, newSaltB64, newIvB64, newWrappedDekB64 }).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        if (err.status === 200) this.router.navigate(['/login']);
        else console.log(err);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
