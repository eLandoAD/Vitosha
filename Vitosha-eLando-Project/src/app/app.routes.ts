import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { VerifyEmail } from './pages/verify-email/verify-email';
import { authGuard } from './guards/auth-guard';
import { Dashboard } from './pages/dashboard/dashboard';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { ResetPassword } from './pages/reset-password/reset-password';
import { ChangePassword } from './pages/change-password/change-password';



export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'verify-email', component: VerifyEmail },
    { path: 'forgot-password', component: ForgotPassword },
    { path: 'reset-password', component: ResetPassword },
    { path: 'change-password', component: ChangePassword, canActivate: [authGuard] },
    { path: 'dashboard', component: Dashboard, canActivate: [authGuard] }
];


