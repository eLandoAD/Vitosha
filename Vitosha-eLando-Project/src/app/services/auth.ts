import { inject } from '@angular/core';
import { Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Crypto } from './crypto';

@Service()
export class Auth {
    private token: string | null = null;
    private dek: CryptoKey | null = null;
    private crypto = inject(Crypto);
    private http = inject(HttpClient);
    private username: string | null = null;

    public register(email: string, username: string, password: string, saltB64: string, ivB64: string, wrappedDekB64: string) {
        return this.http.post('http://localhost:8080/auth/register', { email, username, password, saltB64, ivB64, wrappedDekB64 });

    }
    public login(email: string, password: string) {
        return this.http.post<any>('http://localhost:8080/auth/login', { email, password }).pipe(
            tap(async (response: any) => {
                this.token = response.token;
                if (response.saltB64 && response.ivB64 && response.wrappedDekB64) {
                    const salt = Uint8Array.from(atob(response.saltB64), c => c.charCodeAt(0));
                    const iv = Uint8Array.from(atob(response.ivB64), c => c.charCodeAt(0));
                    const wrappedDek = Uint8Array.from(atob(response.wrappedDekB64), c => c.charCodeAt(0));
                    const kek = await this.crypto.deriveKEK(password, salt);
                    const dek = await this.crypto.unwrapDEK(wrappedDek.buffer, kek, iv);
                    this.setDek(dek);
                }
            })
        );
    }

    public logout() {
        this.token = null;
        this.dek = null;
        this.username = null;
    }

    public getToken() {
        return this.token;
    }

    public isLoggedIn() {
        return this.token !== null;
    }

    setDek(dek: CryptoKey) {
        this.dek = dek;
    }

    getDek() {
        return this.dek;
    }

    setUsername(name: string) {
        this.username = name;
    }


    getUsername() {
        return this.username;
    }


}
