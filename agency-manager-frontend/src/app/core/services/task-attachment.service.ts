import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class TaskAttachmentService {
  private http = inject(HttpClient);
  private API = 'http://localhost:5000/attachments';

  getAttachments(taskId: string) {
    return this.http.get<any[]>(`${this.API}?taskId=${taskId}`);
  }

  addAttachment(formData: FormData) {
    return this.http.post<any>(`${this.API}`, formData);
  }

  removeAttachment(attachmentId: string) {
    return this.http.delete<any>(`${this.API}/${attachmentId}`);
  }
}
