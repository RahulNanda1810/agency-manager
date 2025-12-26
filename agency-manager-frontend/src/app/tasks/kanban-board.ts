// agency-manager-frontend/src/app/tasks/kanban-board.ts
import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService } from '../core/services/task.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './kanban-board.html',
  styleUrls: ['./kanban-board.scss']
})
export class KanbanBoardComponent implements OnInit {
  @Input() projectId: string = '';
  @Input() sprintId: string = '';

  backlog: any[] = [];
  todo: any[] = [];
  inProgress: any[] = [];
  inReview: any[] = [];
  done: any[] = [];
  sprints: any[] = [];

  columns = [
    { id: 'backlog', title: 'Backlog', tasks: this.backlog },
    { id: 'todo', title: 'To Do', tasks: this.todo },
    { id: 'in-progress', title: 'In Progress', tasks: this.inProgress },
    { id: 'in-review', title: 'In Review', tasks: this.inReview },
    { id: 'done', title: 'Done', tasks: this.done }
  ];

  constructor(
    private taskService: TaskService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('🎯 Kanban board loading with projectId:', this.projectId, 'sprintId:', this.sprintId);
    this.loadSprints();
    this.loadBoard();
  }

  ngOnChanges() {
    console.log('🔄 Inputs changed - projectId:', this.projectId, 'sprintId:', this.sprintId);
    if (this.projectId) {
      this.loadSprints();
      this.loadBoard();
    }
  }

  loadSprints() {
    this.taskService.getSprints(this.projectId).subscribe({
      next: (sprints: any) => {
        this.sprints = Array.isArray(sprints) ? sprints : [];
        console.log('📋 Sprints loaded:', this.sprints);
      },
      error: (err) => {
        console.error('❌ Failed to load sprints:', err);
      }
    });
  }

  loadBoard() {
    console.log('📊 Loading board for project:', this.projectId);
    
    if (this.sprintId) {
      console.log('Loading sprint board:', this.sprintId);
      this.taskService.getSprintBoard(this.projectId, this.sprintId).subscribe({
        next: (board: any) => {
          console.log('✅ Sprint board loaded:', board);
          this.backlog = board.backlog || [];
          this.todo = board.todo || [];
          this.inProgress = board['in-progress'] || [];
          this.inReview = board['in-review'] || [];
          this.done = board.done || [];
          
          this.updateColumns();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Failed to load sprint board:', err);
        }
      });
    } else {
      console.log('Loading all tasks for project');
      this.taskService.getTasks(this.projectId).subscribe({
        next: (tasks: any) => {
          console.log('✅ Tasks loaded:', tasks);
          const taskList = Array.isArray(tasks) ? tasks : (tasks.data || []);
          console.log('📋 Task list with sprints:', taskList.map((t: any) => ({ id: t._id.slice(-6), title: t.title, sprintId: t.sprintId })));
          
          this.backlog = taskList.filter((t: any) => t.status === 'backlog');
          this.todo = taskList.filter((t: any) => t.status === 'todo');
          this.inProgress = taskList.filter((t: any) => t.status === 'in-progress');
          this.inReview = taskList.filter((t: any) => t.status === 'in-review');
          this.done = taskList.filter((t: any) => t.status === 'done');
          
          console.log('📊 Filtered tasks:', {
            backlog: this.backlog.length,
            todo: this.todo.length,
            inProgress: this.inProgress.length,
            inReview: this.inReview.length,
            done: this.done.length
          });
          
          this.updateColumns();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Failed to load tasks:', err);
        }
      });
    }
  }

  updateColumns() {
    this.columns = [
      { id: 'backlog', title: 'Backlog', tasks: this.backlog },
      { id: 'todo', title: 'To Do', tasks: this.todo },
      { id: 'in-progress', title: 'In Progress', tasks: this.inProgress },
      { id: 'in-review', title: 'In Review', tasks: this.inReview },
      { id: 'done', title: 'Done', tasks: this.done }
    ];
  }

  drop(event: CdkDragDrop<any[]>, newStatus: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update task status in backend
      this.taskService.updateTask(task._id, { status: newStatus }).subscribe({
        next: () => {
          console.log('✅ Task status updated to:', newStatus);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Failed to update task:', err);
          // Revert on error
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );
          this.cdr.detectChanges();
        }
      });
    }
  }

  getTaskTypeIcon(type: string): string {
    const icons: any = {
      'story': '📖',
      'task': '✓',
      'bug': '🐛',
      'epic': '⚡',
      'subtask': '➥'
    };
    return icons[type] || '📋';
  }

  getPriorityColor(priority: string): string {
    const colors: any = {
      'highest': '#ff0000',
      'high': '#ff5722',
      'medium': '#ff9800',
      'low': '#4caf50',
      'lowest': '#2196f3'
    };
    return colors[priority] || '#999';
  }

  openTask(task: any) {
    // Navigate to task detail view
    this.router.navigate(['/tasks', task._id]);
  }

  assignToSprint(task: any, sprintId: string, event: Event) {
    event.stopPropagation();
    
    console.log('🎯 Assigning task to sprint:', { taskId: task._id, sprintId, currentSprintId: task.sprintId });
    
    const updateData = sprintId ? { sprintId } : { sprintId: null };
    
    console.log('📤 Sending update:', updateData);
    
    this.taskService.updateTask(task._id, updateData).subscribe({
      next: (updated) => {
        console.log('✅ Task assigned to sprint, response:', updated);
        task.sprintId = updated.sprintId;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Failed to assign task to sprint:', err);
        alert('Failed to assign task to sprint');
      }
    });
  }
}