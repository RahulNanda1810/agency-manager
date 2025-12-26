import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router, private cd: ChangeDetectorRef) {}

  login() {
    this.error = '';
    this.loading = true;
    console.log('Login button clicked');
    this.auth.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        console.log('Login response:', res);
        if (res && res.token) {
          localStorage.setItem('token', res.token);
          if (res.user?._id) {
            localStorage.setItem('userId', res.user._id);
          }
          console.log('Redirecting to organizations...');
          this.router.navigate(['/organizations']);
        } else {
          this.error = 'Invalid username or password';
        }
        this.loading = false;
        this.cd.detectChanges();
      },
      error: err => {
        console.log('Login error:', err);
        if (err.status === 401) {
          this.error = 'Invalid username or password';
        } else {
          this.error = err.error?.message || 'Login failed';
        }
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }
}
