import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectListComponent } from './project-list';
import { OrganizationService } from '../core/services/organization.service';
import { ClientService } from '../core/services/client.service';

@Component({
  standalone: true,
  imports: [CommonModule, ProjectListComponent],
  template: `
    <h2>Projects</h2>
    <app-project-list *ngIf="orgId && clientId" [orgId]="orgId" [clientId]="clientId"></app-project-list>
    <div *ngIf="!orgId || !clientId">No organizations or clients found.</div>
  `
})
export class ProjectsComponent {
  orgId: string = '';
  clientId: string = '';
  private orgService = inject(OrganizationService);
  private clientService = inject(ClientService);
  ngOnInit() {
    this.orgService.getOrganizations().subscribe(orgs => {
      if (Array.isArray(orgs) && orgs.length > 0) {
        this.orgId = orgs[0]._id;
        this.clientService.getClients(this.orgId).subscribe(clients => {
          if (Array.isArray(clients) && clients.length > 0) {
            this.clientId = clients[0]._id;
          }
        });
      }
    });
  }
}
