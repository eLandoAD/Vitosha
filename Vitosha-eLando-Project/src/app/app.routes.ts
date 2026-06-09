import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { VerifyEmail } from './pages/verify-email/verify-email';
import { authGuard } from './guards/auth-guard';
import { Dashboard } from './pages/dashboard/dashboard';



export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'verify-email', component: VerifyEmail },
    { path: 'dashboard', component: Dashboard, canActivate: [authGuard] }
];


