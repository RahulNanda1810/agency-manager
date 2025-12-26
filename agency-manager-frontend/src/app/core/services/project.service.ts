import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private API = `${environment.apiUrl}/projects`;

  getProjects(clientId: string) {
    return this.http.get<any[]>(`${this.API}?clientId=${clientId}`);
  }

  createProject(clientId: string, data: { name: string }) {
    return this.http.post<any>(`${this.API}`, { ...data, clientId });
  }

  updateProject(projectId: string, data: { name: string }) {
    return this.http.put<any>(`${this.API}/${projectId}`, data);
  }

  deleteProject(projectId: string) {
    return this.http.delete<any>(`${this.API}/${projectId}`);
  }
}
