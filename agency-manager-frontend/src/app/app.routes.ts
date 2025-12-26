import { Routes } from '@angular/router';
import { authGuard } from './core/services/auth.service';

export const routes: Routes = [

  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    loadComponent: () => import('./welcome/welcome').then(m => m.WelcomeComponent),
    pathMatch: 'full'
  },
  {
    path: 'my-tasks',
    canActivate: [authGuard],
    loadComponent: () => import('./my-tasks/my-tasks.component').then(m => m.MyTasksComponent)
  },
  {
    path: 'organizations',
    canActivate: [authGuard],
    loadComponent: () => import('./organizations/organization-list').then(m => m.OrganizationListComponent)
  },
  {
    path: 'organizations/:orgId',
    canActivate: [authGuard],
    loadComponent: () => import('./organizations/organization-detail').then(m => m.OrganizationDetailComponent)
  },
  {
    path: 'organizations/:orgId/clients/:clientId',
    canActivate: [authGuard],
    loadComponent: () => import('./clients/client-detail').then(m => m.ClientDetailComponent)
  },
  {
    path: 'organizations/:orgId/clients/:clientId/projects/:projectId',
    canActivate: [authGuard],
    loadComponent: () => import('./projects/project-detail').then(m => m.ProjectDetailComponent)
  },
  { path: '**', redirectTo: 'auth/login' }
];
