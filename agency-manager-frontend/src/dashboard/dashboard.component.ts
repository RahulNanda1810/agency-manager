import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: any = {
    total: 0,
    todo: 0,
    inProgress: 0,
    inReview: 0,
    done: 0,
    overdue: 0
  };
  recentTasks: any[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;

    // Load task statistics
    this.http.get<any>('http://localhost:5000/tasks/my-stats').subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => console.error('Failed to load stats', err)
    });

    // Load recent tasks
    this.http.get<any[]>('http://localhost:5000/tasks/my-tasks').subscribe({
      next: (tasks) => {
        this.recentTasks = tasks.slice(0, 5); // Get first 5 tasks
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load tasks', err);
        this.loading = false;
      }
    });
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

  getCompletionPercentage(): number {
    if (this.stats.total === 0) return 0;
    return Math.round((this.stats.done / this.stats.total) * 100);
  }
}
