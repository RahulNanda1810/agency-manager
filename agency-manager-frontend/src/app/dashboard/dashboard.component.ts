import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterLink],
  template: `
    <h1>Dashboard</h1>

    <nav>
      <a routerLink="organizations">Organizations</a> |
      <a routerLink="clients">Clients</a> |
      <a routerLink="projects">Projects</a> |
      <a routerLink="tasks">Tasks</a>
    </nav>

    <br />

    <button (click)="logout()">Logout</button>

    <hr />

    <router-outlet></router-outlet>
  `
})
export class DashboardComponent {
  constructor(private auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}
