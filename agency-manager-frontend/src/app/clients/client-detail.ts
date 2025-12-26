import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectListComponent } from '../projects/project-list';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, ProjectListComponent, RouterModule],
  template: `
    <div class="client-detail-container">
      <div class="breadcrumb">
        <a [routerLink]="['/organizations', orgId]" class="breadcrumb-link">{{ orgName }}</a>
        <span class="breadcrumb-current">{{ clientName }}</span>
      </div>
      
      <div class="header-with-back">
        <a [routerLink]="['/organizations', orgId]" class="back-button">
          ← Back to All Clients
        </a>
        <h2>Client: {{ clientName }}</h2>
      </div>
      
      <app-project-list [orgId]="orgId" [clientId]="clientId"></app-project-list>
    </div>
  `,
  styleUrls: ['./client-detail.scss']
})
export class ClientDetailComponent implements OnInit {
  clientId = '';
  clientName = '';
  orgId = '';
  orgName = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.clientId = this.route.snapshot.paramMap.get('clientId') || '';
    this.orgId = this.route.snapshot.paramMap.get('orgId') || '';
    this.clientName = this.route.snapshot.paramMap.get('clientName') || '';
    this.orgName = this.route.snapshot.paramMap.get('orgName') || '';

    this.route.paramMap.subscribe(params => {
      const newClientId = params.get('clientId') || '';
      const newOrgId = params.get('orgId') || '';
      
      if (newClientId !== this.clientId || newOrgId !== this.orgId) {
        this.clientId = newClientId;
        this.orgId = newOrgId;
        this.clientName = params.get('clientName') || '';
        this.orgName = params.get('orgName') || '';
      }
    });
  }
}
