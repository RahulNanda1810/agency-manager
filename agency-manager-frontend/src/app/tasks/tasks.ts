import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskListComponent } from './task-list';
import { OrganizationService } from '../core/services/organization.service';
import { ClientService } from '../core/services/client.service';
import { ProjectService } from '../core/services/project.service';

@Component({
  standalone: true,
  imports: [CommonModule, TaskListComponent],
  template: `
    <h2>Tasks</h2>
    <app-task-list *ngIf="projectId" [projectId]="projectId"></app-task-list>
    <div *ngIf="!projectId">No organizations, clients, or projects found.</div>
  `
})
export class TasksComponent {
  orgId: string = '';
  clientId: string = '';
  projectId: string = '';
  private orgService = inject(OrganizationService);
  private clientService = inject(ClientService);
  private projectService = inject(ProjectService);
  private cdr = inject(ChangeDetectorRef);
  ngOnInit() {
    this.orgService.getOrganizations().subscribe(orgs => {
      if (Array.isArray(orgs) && orgs.length > 0) {
        this.orgId = orgs[0]._id;
        this.clientService.getClients(this.orgId).subscribe(clients => {
          if (Array.isArray(clients) && clients.length > 0) {
            this.clientId = clients[0]._id;
            this.projectService.getProjects(this.clientId).subscribe(projects => {
              if (Array.isArray(projects) && projects.length > 0) {
                this.projectId = projects[0]._id;
                this.cdr.detectChanges();
              }
            });
          }
        });
      }
    });
  }
}
