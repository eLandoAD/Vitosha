import { inject } from '@angular/core';
import { Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Service()
export class Auth {
    private token: string | null = null;
    private http = inject(HttpClient);

    public register(email: string, username: string, password: string) {
        return this.http.post('http://localhost:8080/api/auth/register', { email, username, password });

    }
    public login(email: string, password: string) {
        return this.http.post('http://localhost:8080/api/auth/login', { email, password });
    }

    public logout() {
        this.token = null;
    }

    public getToken() {
        return this.token;
    }

    public isLoggedIn() {
        return this.token !== null;
    }
}
