import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, CanActivateFn } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private API = 'http://localhost:5000/auth';

  login(data: any) {
    return this.http.post<any>(`${this.API}/login`, data);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}

/* ✅ Route Guard */
export const authGuard: CanActivateFn = () => {
  return !!localStorage.getItem('token');
};

/* ✅ HTTP Interceptor */
export const authInterceptor = (req: any, next: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }
  return next(req);
};
