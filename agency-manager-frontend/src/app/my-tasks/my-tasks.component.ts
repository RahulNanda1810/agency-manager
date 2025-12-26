import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.scss']
})
export class MyTasksComponent implements OnInit {
  tasks: any[] = [];
  filteredTasks: any[] = [];
  loading = true;  // Start with loading = true for immediate loading state
  
  // Filters
  statusFilter: string = 'all';
  searchQuery: string = '';
  
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    // Eager load immediately in constructor
    this.loadMyTasks();
  }

  ngOnInit() {
    // Data already loading from constructor
    // This ensures immediate loading without waiting for lifecycle
  }

  loadMyTasks() {
    this.loading = true;
    
    this.http.get<any[]>(`http://localhost:5000/tasks/my-tasks`).subscribe({
      next: (tasks) => {
        console.log('✅ Tasks loaded:', tasks);
        this.tasks = tasks;
        this.applyFilters();
        this.loading = false;
        console.log('📊 Filtered tasks:', this.filteredTasks.length, 'Loading:', this.loading);
        this.cdr.detectChanges(); // Force change detection
      },
      error: (err) => {
        console.error('Failed to load tasks', err);
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection
      }
    });
  }

  applyFilters() {
    this.filteredTasks = this.tasks.filter(task => {
      // Status filter
      const matchesStatus = this.statusFilter === 'all' || task.status === this.statusFilter;
      
      // Search filter
      const matchesSearch = !this.searchQuery || 
        task.title?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
    console.log('🔍 Applied filters - Total:', this.tasks.length, 'Filtered:', this.filteredTasks.length);
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'todo': '#6B7280',
      'in-progress': '#3B82F6',
      'in-review': '#F59E0B',
      'done': '#10B981'
    };
    return colors[status] || '#6B7280';
  }

  getPriorityColor(priority: string): string {
    const colors: any = {
      'low': '#10B981',
      'medium': '#F59E0B',
      'high': '#EF4444'
    };
    return colors[priority] || '#6B7280';
  }

  formatDate(date: string): string {
    if (!date) return 'No due date';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  updateTaskStatus(task: any, newStatus: string) {
    this.http.patch(`http://localhost:5000/tasks/${task._id}`, { status: newStatus })
      .subscribe({
        next: () => {
          task.status = newStatus;
          this.applyFilters();
        },
        error: (err) => console.error('Failed to update task', err)
      });
  }

  isOverdue(task: any): boolean {
    if (!task.dueDate || task.status === 'done') return false;
    return new Date(task.dueDate) < new Date();
  }

  getTaskCountByStatus(status: string): number {
    return this.tasks.filter(t => t.status === status).length;
  }
}
