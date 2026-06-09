import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { VerifyEmail } from './pages/verify-email/verify-email';
import { authGuard } from './guards/auth-guard';



export const routes: Routes = [ 
    { path: 'login', component: Login},
    { path: 'register', component: Register},
    { path: 'verify-email', component: VerifyEmail},
    { path: 'dashboard', component: Login, canActivate: [authGuard] }
 ];

 
