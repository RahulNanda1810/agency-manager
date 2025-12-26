import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    if (!this.name || !this.email || !this.password) {
      this.error = 'All fields are required.';
      return;
    }
    this.error = '';
    this.loading = true;
    this.authRegister({ name: this.name, email: this.email, password: this.password });
  }

  authRegister(data: { name: string; email: string; password: string }) {
    // Call backend API for registration
    this.authRegisterApi(data).subscribe({
      next: (res) => {
        this.loading = false;
        // Registration successful, redirect to login
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Registration failed.';
      }
    });
  }

  authRegisterApi(data: { name: string; email: string; password: string }) {
    // Directly use HttpClient since AuthService does not have register()
    // You can move this to AuthService if preferred
    return this.auth['http'].post<any>(environment.apiUrl + '/auth/register', data);
  }
}
