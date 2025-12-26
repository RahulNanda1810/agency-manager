import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-comments-attachments',
  imports: [CommonModule, FormsModule],
  template: `
    <h3>Comments</h3>
    <form (submit)="addComment($event)">
      <input [(ngModel)]="commentText" name="commentText" placeholder="Add a comment" required />
      <button type="submit">Add Comment</button>
    </form>
    <ul>
      <li *ngFor="let c of comments">{{ c.text }}</li>
    </ul>

    <h3>Attachments</h3>
    <form (submit)="uploadFile($event)">
      <input type="file" (change)="onFileChange($event)" required />
      <button type="submit">Upload</button>
    </form>
    <ul>
      <li *ngFor="let a of attachments">
        <a [href]="a.url" target="_blank">{{ a.filename }}</a>
      </li>
    </ul>
  `
})
export class CommentsAttachmentsComponent {
  commentText = '';
  comments: any[] = [];
  attachments: any[] = [];
  selectedFile: File | null = null;

  constructor(private http: HttpClient) {
    this.loadComments();
    this.loadAttachments();
  }

  addComment(event: Event) {
    event.preventDefault();
    this.http.post('/comments', { text: this.commentText }).subscribe(() => {
      this.commentText = '';
      this.loadComments();
    });
  }

  loadComments() {
    this.http.get<any[]>('/comments').subscribe(data => this.comments = data);
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile(event: Event) {
    event.preventDefault();
    if (!this.selectedFile) return;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    this.http.post('/attachments', formData).subscribe(() => {
      this.selectedFile = null;
      this.loadAttachments();
    });
  }

  loadAttachments() {
    this.http.get<any[]>('/attachments').subscribe(data => this.attachments = data);
  }
}
