import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { TaskAttachmentService } from '../core/services/task-attachment.service';

@Component({
  selector: 'app-task-attachments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './task-attachments.html',
  styleUrls: ['./task-attachments.scss']
})
export class TaskAttachmentsComponent {
  @Input() taskId: string = '';
  attachments: any[] = [];
  loading = false;
  error = '';

  constructor(
    private attachmentService: TaskAttachmentService, 
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges() {
    if (this.taskId) {
      this.loadAttachments();
    }
  }

  loadAttachments() {
    this.loading = true;
    this.error = '';
    this.attachmentService.getAttachments(this.taskId).subscribe({
      next: (res: any) => {
        console.log('Loaded attachments:', res);
        this.attachments = Array.isArray(res) ? res : (res.data || []);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Load error:', err);
        this.error = 'Failed to load attachments.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  addAttachment(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    
    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', this.taskId);
    
    console.log('Uploading file:', file.name);
    
    this.attachmentService.addAttachment(formData).subscribe({
      next: (response: any) => {
        console.log('Upload response:', response);
        
        const attachment = response.attachment || response;
        this.attachments = [...this.attachments, attachment];
        
        this.loading = false;
        event.target.value = '';
        
        console.log('✅ File uploaded successfully!');
        this.cdr.markForCheck();
      },
      error: err => {
        console.error('Upload error:', err);
        this.error = err.error?.message || 'Failed to upload attachment.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  removeAttachment(attachment: any) {
    if (!confirm('Remove this attachment?')) return;
    
    this.loading = true;
    this.error = '';
    
    this.attachmentService.removeAttachment(attachment._id).subscribe({
      next: () => {
        this.attachments = this.attachments.filter(a => a._id !== attachment._id);
        this.loading = false;
        console.log('✅ Attachment removed');
        this.cdr.markForCheck();
      },
      error: err => {
        console.error('Remove error:', err);
        this.error = 'Failed to remove attachment.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
  
  getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch(ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      case 'zip':
      case 'rar': return '📦';
      default: return '📎';
    }
  }
}