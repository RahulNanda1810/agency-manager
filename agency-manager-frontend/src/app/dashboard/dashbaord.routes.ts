import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: 'clients',
    loadComponent: () =>
      import('../clients/clients')
        .then(m => m.ClientsComponent)
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('../projects/projects')
        .then(m => m.ProjectsComponent)
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('../tasks/tasks')
        .then(m => m.TasksComponent)
  }
];
