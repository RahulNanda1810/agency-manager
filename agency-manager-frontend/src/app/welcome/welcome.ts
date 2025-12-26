import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.scss']
})
export class WelcomeComponent implements AfterViewInit {
  constructor(private router: Router) {}

  scrollToOrganizations() {
    const orgSection = document.getElementById('org-section');
    if (orgSection) {
      orgSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  ngAfterViewInit() {
    // Optionally, you can add logic here if needed
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
