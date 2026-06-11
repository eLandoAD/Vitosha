import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-verify-email',
  imports: [],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail {

  private router = inject(Router);
  protected auth = inject(Auth);
  
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
