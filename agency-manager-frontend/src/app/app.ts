import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './shared/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('agency-manager-frontend');
  
  constructor(public router: Router) {}
  
  shouldShowNavbar(): boolean {
    const url = this.router.url;
    return !url.includes('/auth/') && url !== '/';
  }
}
