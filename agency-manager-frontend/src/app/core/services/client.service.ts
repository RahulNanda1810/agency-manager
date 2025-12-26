import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private http = inject(HttpClient);
  private API = 'http://localhost:5000/clients';

  getClients(orgId: string) {
    return this.http.get<any[]>(`${this.API}?orgId=${orgId}`);
  }

  createClient(orgId: string, data: { name: string }) {
    return this.http.post<any>(`${this.API}?orgId=${orgId}`, data);
  }

  updateClient(clientId: string, orgId: string, data: { name: string }) {
    return this.http.put<any>(`${this.API}/${clientId}?orgId=${orgId}`, data);
  }

  deleteClient(clientId: string, orgId: string) {
    return this.http.delete<any>(`${this.API}/${clientId}?orgId=${orgId}`);
  }
}
