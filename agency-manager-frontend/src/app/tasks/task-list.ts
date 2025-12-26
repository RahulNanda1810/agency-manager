// agency-manager-frontend/src/app/tasks/task-list.ts
import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { TaskCommentsComponent } from './task-comments';
import { TaskAttachmentsComponent } from './task-attachments';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../core/services/task.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TaskCommentsComponent, TaskAttachmentsComponent],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.scss']
})
export class TaskListComponent {
  @Input() projectId: string = '';
  @Input() orgId: string = '';
  tasks: any[] = [];
  sprints: any[] = [];
  members: any[] = [];
  createTaskForm: FormGroup;
  loading = false;
  error = '';
  editingTask: any = null;
  editTaskForm: FormGroup;
  filterStatus: string = '';
  filterAssignee: string = '';
  selectedTask: any = null;

  constructor(private taskService: TaskService, private fb: FormBuilder, private cdr: ChangeDetectorRef, private http: HttpClient) {
    this.createTaskForm = this.fb.group({
      title: ['', Validators.required],
      status: ['todo', Validators.required],  // Default to 'todo'
      assigneeId: ['']
    });
    this.editTaskForm = this.fb.group({
      title: ['', Validators.required],
      status: ['', Validators.required],
      assigneeId: ['']
    });
  }

  ngOnInit() {
    if (this.projectId) {
      this.loadSprints();
      this.loadTasks();
      if (this.orgId) {
        this.loadMembers();
      }
    }
  }

  loadMembers() {
    this.http.get<any[]>(`http://localhost:5000/orgs/${this.orgId}/members`).subscribe({
      next: (members) => {
        this.members = members;
      },
      error: (err) => console.error('Failed to load members', err)
    });
  }
  
  ngOnChanges() {
    if (this.projectId) {
      this.loadSprints();
      this.loadTasks();
    }
  }

  loadSprints() {
    this.taskService.getSprints(this.projectId).subscribe({
      next: (sprints: any) => {
        this.sprints = Array.isArray(sprints) ? sprints : [];
      },
      error: (err) => {
        console.error('Failed to load sprints:', err);
      }
    });
  }

  loadTasks() {
    this.loading = true;
    this.taskService.getTasks(this.projectId, this.filterStatus, this.filterAssignee || undefined).subscribe({
      next: (res: any) => {
        this.tasks = Array.isArray(res) ? res : (res.data || []);
        // Add sprint names to tasks
        this.tasks.forEach(task => {
          if (task.sprintId) {
            const sprint = this.sprints.find(s => s._id === task.sprintId);
            task.sprintName = sprint?.name || '';
          }
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'Failed to load tasks.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  createTask() {
  if (this.createTaskForm.invalid) return;
  this.loading = true;
  this.taskService.createTask(this.projectId, this.createTaskForm.value).subscribe({
    next: task => {
      console.log('✅ Task created:', task);
      this.tasks.push(task);
      this.createTaskForm.reset({ status: 'todo' });
      this.loading = false;
      this.cdr.detectChanges();
      
      // Emit event or reload page to refresh board
      window.location.reload(); // Quick fix - reload entire page
    },
    error: err => {
      console.error('❌ Failed to create task:', err);
      this.error = 'Failed to create task.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  startEdit(task: any) {
    this.editingTask = task;
    this.editTaskForm.setValue({ 
      title: task.title, 
      status: task.status, 
      assigneeId: task.assigneeId || '' 
    });
  }

  cancelEdit() {
    this.editingTask = null;
    this.editTaskForm.reset();
  }

  updateTask() {
    if (!this.editingTask || this.editTaskForm.invalid) return;
    this.loading = true;
    this.taskService.updateTask(this.editingTask._id, this.editTaskForm.value).subscribe({
      next: updated => {
        const idx = this.tasks.findIndex(t => t._id === this.editingTask._id);
        if (idx > -1) this.tasks[idx] = updated;
        this.cancelEdit();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.error = 'Failed to update task.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteTask(task: any) {
    if (!confirm('Delete this task?')) return;
    this.loading = true;
    this.taskService.deleteTask(task._id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t._id !== task._id);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.error = 'Failed to delete task.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    this.loadTasks();
  }

  selectTask(task: any) {
    this.selectedTask = this.selectedTask?._id === task._id ? null : task;
  }

  assignToSprint(task: any, sprintId: string) {
    const updateData = sprintId ? { sprintId } : { sprintId: null };
    
    this.taskService.updateTask(task._id, updateData).subscribe({
      next: (updated) => {
        task.sprintId = updated.sprintId;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('Failed to assign task to sprint');
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'backlog': 'Backlog',
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'in-review': 'In Review',
      'done': 'Done'
    };
    return labels[status] || status;
  }
  getMemberName(assigneeId: string): string {
    if (!assigneeId) return 'Unassigned';
    const member = this.members.find(m => m.userId === assigneeId);
    return member ? member.email : 'Unknown';
  }}