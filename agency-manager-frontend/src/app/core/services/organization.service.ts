import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private http = inject(HttpClient);
  private API = `${environment.apiUrl}/orgs`;

  getOrganizations() {
    return this.http.get<any[]>(`${this.API}`);
  }

  getAllOrganizations() {
    return this.http.get<any[]>(`${this.API}/all`);
  }

  requestAccess(orgId: string, message: string) {
    return this.http.post<any>(`${this.API}/${orgId}/access-requests`, { message });
  }

  createOrganization(data: { name: string }) {
    return this.http.post<any>(`${this.API}`, data);
  }

  deleteOrganization(id: string) {
    return this.http.delete<any>(`${this.API}/${id}`);
  }

  updateOrganization(id: string, data: { name: string }) {
    return this.http.put<any>(`${this.API}/${id}`, data);
  }
}
