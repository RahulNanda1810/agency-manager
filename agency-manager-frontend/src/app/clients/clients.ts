import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientListComponent } from './client-list';
import { OrganizationService } from '../core/services/organization.service';

@Component({
  standalone: true,
  imports: [CommonModule, ClientListComponent],
  template: `
    <h2>Clients</h2>
    <app-client-list *ngIf="orgId" [orgId]="orgId"></app-client-list>
    <div *ngIf="!orgId">No organizations found.</div>
  `
})
export class ClientsComponent {
  orgId: string = '';
  private orgService = inject(OrganizationService);
  ngOnInit() {
    this.orgService.getOrganizations().subscribe(orgs => {
      if (Array.isArray(orgs) && orgs.length > 0) {
        this.orgId = orgs[0]._id;
      }
    });
  }
}
