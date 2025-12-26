import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class TaskCommentService {
  private http = inject(HttpClient);
  private API = 'http://localhost:5000/comments';

  getComments(taskId: string) {
    return this.http.get<any[]>(`${this.API}?taskId=${taskId}`);
  }

  addComment(taskId: string, data: { text: string }) {
    return this.http.post<any>(`${this.API}`, { ...data, taskId });
  }
}
