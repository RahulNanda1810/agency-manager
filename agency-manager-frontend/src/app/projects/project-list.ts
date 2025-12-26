import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../core/services/project.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './project-list.html',
  styleUrls: ['./project-list.scss']
})
export class ProjectListComponent {
  @Input() orgId: string = '';
  @Input() clientId: string = '';
  projects: any[] = [];
  createProjectForm: FormGroup;
  loading = false;
  error = '';
  editingProject: any = null;
  editProjectForm: FormGroup;

  constructor(private projectService: ProjectService, private fb: FormBuilder, private cdr: ChangeDetectorRef, private router: Router) {
    this.createProjectForm = this.fb.group({
      name: ['', Validators.required]
    });
    this.editProjectForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.clientId) {
      this.loadProjects();
    }
  }
  ngOnChanges() {
    if (this.clientId) {
      this.loadProjects();
    }
  }

  loadProjects() {
    this.loading = true;
    this.projectService.getProjects(this.clientId).subscribe({
      next: (res: any) => {
        this.projects = Array.isArray(res) ? res : (res.data || []);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'Failed to load projects.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  createProject() {
    if (this.createProjectForm.invalid) return;
    this.loading = true;
    this.projectService.createProject(this.clientId, this.createProjectForm.value).subscribe({
      next: project => {
        this.projects.push(project);
        this.createProjectForm.reset();
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to create project.';
        this.loading = false;
      }
    });
  }

  startEdit(project: any) {
    this.editingProject = project;
    this.editProjectForm.setValue({ name: project.name });
  }

  cancelEdit() {
    this.editingProject = null;
    this.editProjectForm.reset();
  }

  updateProject() {
    if (!this.editingProject || this.editProjectForm.invalid) return;
    this.loading = true;
    this.projectService.updateProject(this.editingProject._id, this.editProjectForm.value).subscribe({
      next: updated => {
        const idx = this.projects.findIndex(p => p._id === this.editingProject._id);
        if (idx > -1) this.projects[idx] = updated;
        this.cancelEdit();
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to update project.';
        this.loading = false;
      }
    });
  }

  deleteProject(project: any) {
    if (!confirm('Delete this project?')) return;
    this.loading = true;
    this.projectService.deleteProject(project._id).subscribe({
      next: () => {
        this.projects = this.projects.filter(p => p._id !== project._id);
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to delete project.';
        this.loading = false;
      }
    });
  }

  goToProject(project: any) {
    this.router.navigate(['/organizations', this.orgId, 'clients', this.clientId, 'projects', project._id]);
  }
}
