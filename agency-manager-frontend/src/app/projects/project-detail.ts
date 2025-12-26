// Update agency-manager-frontend/src/app/projects/project-detail.ts
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskListComponent } from '../tasks/task-list';
import { KanbanBoardComponent } from '../tasks/kanban-board';
import { SprintCreateModalComponent } from '../sprints/sprint-create-modal';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TaskListComponent, KanbanBoardComponent, RouterModule, SprintCreateModalComponent],
  templateUrl: './project-detail.html',
  styleUrls: ['./project-detail.scss']
})
export class ProjectDetailComponent implements OnInit {
  @ViewChild(SprintCreateModalComponent) sprintModal!: SprintCreateModalComponent;
  
  projectId = '';
  projectName = '';
  clientId = '';
  clientName = '';
  orgId = '';
  orgName = '';
  activeTab: 'board' | 'list' | 'sprints' = 'board';
  
  sprints: any[] = [];
  activeSprint: any = null;
  loading = true;
  showSprintBoard = false;
  selectedSprint: any = null;
  sprintTasks: any[] = [];
  unassignedTasks: any[] = [];
  taskToAdd: string = '';
  sprintTaskForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.sprintTaskForm = this.fb.group({
      title: ['', Validators.required],
      status: ['todo', Validators.required]
    });
  }

  ngOnInit() {
    // Get route parameters synchronously
    this.projectId = this.route.snapshot.paramMap.get('projectId') || '';
    this.clientId = this.route.snapshot.paramMap.get('clientId') || '';
    this.orgId = this.route.snapshot.paramMap.get('orgId') || '';
    
    // Load data immediately
    this.loadProjectDetails();
    this.loadSprints();
    
    // Also subscribe to param changes for navigation
    this.route.paramMap.subscribe(params => {
      const newProjectId = params.get('projectId') || '';
      const newClientId = params.get('clientId') || '';
      const newOrgId = params.get('orgId') || '';
      
      // Only reload if parameters actually changed
      if (newProjectId !== this.projectId || newClientId !== this.clientId || newOrgId !== this.orgId) {
        this.projectId = newProjectId;
        this.clientId = newClientId;
        this.orgId = newOrgId;
        this.loading = true;
        this.loadProjectDetails();
        this.loadSprints();
      }
    });
  }

  loadProjectDetails() {
    console.log('🔍 Loading details for:', { orgId: this.orgId, clientId: this.clientId, projectId: this.projectId });
    
    forkJoin({
      project: this.http.get<any>(`${environment.apiUrl}/projects/${this.projectId}`),
      client: this.http.get<any>(`${environment.apiUrl}/clients/${this.clientId}`),
      orgs: this.http.get<any[]>(`${environment.apiUrl}/orgs`)
    }).subscribe({
      next: (results) => {
        console.log('✅ Loaded all details:', results);
        
        this.projectName = results.project.name;
        this.clientName = results.client.name;
        
        const org = results.orgs.find(o => o._id === this.orgId);
        if (org) {
          this.orgName = org.name;
        }
        
        this.loading = false;
        this.cdr.detectChanges();
        
        console.log('📝 Names set:', {
          orgName: this.orgName,
          clientName: this.clientName,
          projectName: this.projectName
        });
      },
      error: (err) => {
        console.error('❌ Failed to load details:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadSprints() {
    this.http.get<any[]>(`${environment.apiUrl}/api/projects/${this.projectId}/sprints`)
      .subscribe({
        next: (sprints) => {
          this.sprints = sprints;
          this.activeSprint = sprints.find(s => s.status === 'active');
          this.loadAllTasks();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to load sprints', err)
      });
  }

  loadAllTasks() {
    this.http.get<any[]>(`${environment.apiUrl}/tasks?projectId=${this.projectId}`)
      .subscribe({
        next: (tasks) => {
          this.unassignedTasks = tasks.filter(t => !t.sprintId);
          if (this.selectedSprint) {
            this.sprintTasks = tasks.filter(t => t.sprintId === this.selectedSprint._id);
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to load tasks', err)
      });
  }

  selectSprint(sprint: any) {
    this.selectedSprint = sprint;
    this.sprintTasks = [];
    this.loadAllTasks();
  }

  addTaskToSprint() {
    if (!this.taskToAdd || !this.selectedSprint) return;

    this.http.put(`${environment.apiUrl}/tasks/${this.taskToAdd}`, { sprintId: this.selectedSprint._id })
      .subscribe({
        next: () => {
          this.taskToAdd = '';
          this.loadAllTasks();
        },
        error: (err) => alert('Failed to add task to sprint')
      });
  }

  createTaskInSprint() {
    if (this.sprintTaskForm.invalid || !this.selectedSprint) return;

    const taskData = {
      ...this.sprintTaskForm.value,
      projectId: this.projectId,
      sprintId: this.selectedSprint._id
    };

    this.http.post<any>(environment.apiUrl + '/tasks', taskData)
      .subscribe({
        next: (newTask) => {
          console.log('✅ Task created:', newTask);
          this.sprintTasks.push(newTask);
          this.sprintTaskForm.reset({ status: 'todo' });
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Failed to create task:', err);
          alert('Failed to create task');
        }
      });
  }

  removeTaskFromSprint(task: any) {
    this.http.put(`${environment.apiUrl}/tasks/${task._id}`, { sprintId: null })
      .subscribe({
        next: () => {
          this.loadAllTasks();
        },
        error: (err) => alert('Failed to remove task from sprint')
      });
  }

  setActiveTab(tab: 'board' | 'list' | 'sprints') {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  toggleSprintView() {
    this.showSprintBoard = !this.showSprintBoard;
    this.cdr.detectChanges();
  }

  openCreateSprintModal() {
    this.sprintModal.open();
  }

  onSprintCreated(sprintData: any) {
    this.http.post(`${environment.apiUrl}/api/projects/${this.projectId}/sprints`, sprintData)
      .subscribe({
        next: () => {
          console.log('✅ Sprint created successfully');
          this.loadSprints();
        },
        error: (err) => {
          console.error('❌ Failed to create sprint:', err);
          alert('Failed to create sprint: ' + err.message);
        }
      });
  }

  startSprint(sprint: any) {
    this.http.patch(`${environment.apiUrl}/api/projects/${this.projectId}/sprints/${sprint._id}/start`, {})
      .subscribe({
        next: () => {
          alert('Sprint started!');
          this.loadSprints();
        },
        error: (err) => alert('Failed to start sprint: ' + err.message)
      });
  }

  completeSprint(sprint: any) {
    if (confirm('Complete this sprint? Incomplete tasks will be moved to backlog.')) {
      this.http.patch(`${environment.apiUrl}/api/projects/${this.projectId}/sprints/${sprint._id}/complete`, {})
        .subscribe({
          next: () => {
            alert('Sprint completed!');
            this.loadSprints();
          },
          error: (err) => alert('Failed to complete sprint: ' + err.message)
        });
    }
  }
}