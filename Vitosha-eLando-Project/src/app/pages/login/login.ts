import { Component, inject } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private auth = inject(Auth);
  private router = inject(Router);

  public onLogin(email: string, password: string) {
    this.auth.login(email, password).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (error) => console.log(error)
    });
}
}
