import { Component, inject } from '@angular/core';
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

  public onLogin(email: string, password: string) {
    this.auth.login(email, password).subscribe({
      next: (response: any) => {
        this.auth.setUsername(response.username);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => console.log(error)
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

}
