import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'map',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'stands',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'buyers',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/buyers/buyer-endpoints/buyer-endpoints.component').then(
        (m) => m.BuyerEndpointsComponent
      )
  },
  {
    path: 'stands/:standId/buyers',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/stands/stand-buyers/stand-buyers.component').then((m) => m.StandBuyersComponent)
  },
  {
    path: 'add-stands',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/stands/add-stand/add-stand.component').then((m) => m.AddStandComponent)
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent)
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('./features/auth/signup/signup.component').then((m) => m.SignupComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent
          )
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent
          )
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
