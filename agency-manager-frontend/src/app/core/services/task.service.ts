// agency-manager-frontend/src/app/core/services/task.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private API = `${environment.apiUrl}/tasks`;
  private apiUrl = `${environment.apiUrl}/api`;

  getTasks(projectId: string, status?: string, assigneeId?: string) {
    let url = `${this.API}?projectId=${projectId}`;
    if (status) url += `&status=${status}`;
    if (assigneeId) url += `&assigneeId=${assigneeId}`;
    return this.http.get<any[]>(url);
  }

  createTask(projectId: string, data: { title: string; status?: string; assignee?: string }) {
    return this.http.post<any>(`${this.API}`, { ...data, projectId });
  }

  updateTask(taskId: string, data: Partial<any>) {
    return this.http.put<any>(`${this.API}/${taskId}`, data);
  }

  deleteTask(taskId: string) {
    return this.http.delete<any>(`${this.API}/${taskId}`);
  }

  getSprintBoard(projectId: string, sprintId: string) {
    return this.http.get(`${this.apiUrl}/projects/${projectId}/sprints/${sprintId}/board`);
  }

  getSprints(projectId: string) {
    return this.http.get(`${this.apiUrl}/projects/${projectId}/sprints`);
  }

  updateTaskStatus(taskId: string, status: string) {
    return this.http.patch(`${this.API}/${taskId}`, { status });
  }
}