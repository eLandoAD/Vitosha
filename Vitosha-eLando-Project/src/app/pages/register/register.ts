import { Component, inject } from '@angular/core';
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

  public onRegister(email: string, username: string, password: string) {
    this.auth.register(email, username, password).subscribe({
        next: () => this.router.navigate(['/verify']),
        error: (error) => console.log(error)
    });
}
}
