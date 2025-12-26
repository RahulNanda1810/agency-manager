import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <h1>Agency Manager</h1>
      </div>
      
      <div class="nav-links">
        <a routerLink="/my-tasks" routerLinkActive="active" class="nav-link">
          ✓ My Tasks
        </a>
        <a routerLink="/organizations" routerLinkActive="active" class="nav-link">
          🏢 Organizations
        </a>
      </div>

      <div class="nav-actions">
        <button class="logout-btn" (click)="logout()">
          🚪 Logout
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .nav-brand h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .nav-links {
      display: flex;
      gap: 1.5rem;
      flex: 1;
      justify-content: center;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      transition: all 0.2s ease;
      font-weight: 500;
    }

    .nav-link:hover {
      background: rgba(255,255,255,0.1);
    }

    .nav-link.active {
      background: rgba(255,255,255,0.2);
    }

    .nav-actions {
      display: flex;
      gap: 1rem;
    }

    .logout-btn {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 0.5rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .logout-btn:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-1px);
    }
  `]
})
export class NavbarComponent {
  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.router.navigate(['/auth/login']);
  }
}
