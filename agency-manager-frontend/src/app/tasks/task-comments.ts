import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskCommentService } from '../core/services/task-comment.service';

@Component({
  selector: 'app-task-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './task-comments.html',
  styleUrls: ['./task-comments.scss']
})
export class TaskCommentsComponent {
  @Input() taskId: string = '';
  comments: any[] = [];
  commentForm: FormGroup;
  loading = false;
  error = '';

  constructor(private commentService: TaskCommentService, private fb: FormBuilder) {
    this.commentForm = this.fb.group({
      text: ['', Validators.required]
    });
  }

  ngOnChanges() {
    if (this.taskId) {
      this.loadComments();
    }
  }

  ngOnInit() {
    if (this.taskId) {
      this.loadComments();
    }
  }

  loadComments() {
    this.loading = true;
    this.commentService.getComments(this.taskId).subscribe({
      next: (res: any) => {
        this.comments = Array.isArray(res) ? res : (res.data || []);
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load comments.';
        this.loading = false;
      }
    });
  }

  addComment() {
    if (this.commentForm.invalid) return;
    this.loading = true;
    this.commentService.addComment(this.taskId, this.commentForm.value).subscribe({
      next: comment => {
        this.comments.push(comment);
        this.commentForm.reset();
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to add comment.';
        this.loading = false;
      }
    });
  }
}
