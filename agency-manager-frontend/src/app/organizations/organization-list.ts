import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganizationService } from '../core/services/organization.service';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './organization-list.html',
  styleUrls: ['./organization-list.scss']
})
export class OrganizationListComponent {
  organizations: any[] = [];
  allOrganizations: any[] = [];
  showAllOrgs = false;
  createOrgForm: FormGroup;
  loading = false;
  error = '';
  selectedOrg: any = null;
  editingOrg: any = null;
  @Output() organizationSelected = new EventEmitter<any>();


  constructor(private orgService: OrganizationService, private fb: FormBuilder, private cdr: ChangeDetectorRef, private router: Router) {
    this.createOrgForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadOrganizations();
    // Automatically load all organizations for browsing
    this.loadAllOrganizations();
  }

  loadOrganizations() {
    this.loading = true;
    this.error = '';
    this.orgService.getOrganizations().subscribe({
      next: orgs => {
        this.organizations = orgs;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Failed to load user organizations:', err);
        // If user has no orgs or forbidden, that's okay - not an error
        this.organizations = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAllOrganizations() {
    this.showAllOrgs = true;
    this.orgService.getAllOrganizations().subscribe({
      next: orgs => {
        console.log('All organizations received:', orgs);
        // Filter to ensure only organizations (with proper structure)
        this.allOrganizations = orgs.filter((org: any) => 
          org && org._id && org.name && !org.orgId
        );
        console.log('Filtered organizations:', this.allOrganizations);
        this.showAllOrgs = true;
        this.cdr.detectChanges();
      },
      error: err => {
        this.error = 'Failed to load organizations.';
      }
    });
  }

  requestAccess(org: any) {
    this.orgService.requestAccess(org._id, '').subscribe({
      next: () => {
        org.hasRequestedAccess = true;
        this.cdr.detectChanges();
      },
      error: err => {
        alert(err.error?.message || 'Failed to send access request');
      }
    });
  }

  createOrganization() {
    if (this.createOrgForm.invalid) return;
    this.loading = true;
    this.orgService.createOrganization(this.createOrgForm.value).subscribe({
      next: org => {
        this.organizations.push(org);
        this.createOrgForm.reset();
        this.loading = false;
        this.error = '';
      },
      error: err => {
        this.error = err.error?.message || 'Failed to create organization.';
        this.loading = false;
      }
    });
  }

  selectOrganization(org: any) {
    this.selectedOrg = org;
    this.organizationSelected.emit(org);
  }

  goToOrg(org: any) {
    this.router.navigate(['/organizations', org._id]);
  }

  startEdit(org: any) {
    this.editingOrg = org;
    org.editForm = this.fb.group({ name: [org.name, Validators.required] });
  }

  deleteOrg(org: any) {
    this.loading = true;
    this.orgService.deleteOrganization(org._id).subscribe({
      next: () => {
        this.organizations = this.organizations.filter(o => o._id !== org._id);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'Failed to delete organization.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveOrg(org: any) {
    if (org.editForm.invalid) return;
    this.loading = true;
    this.orgService.updateOrganization(org._id, org.editForm.value).subscribe({
      next: (updatedOrg: any) => {
        Object.assign(org, updatedOrg);
        this.editingOrg = null;
        this.loading = false;
        this.error = '';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to update organization.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelEdit(org: any) {
    this.editingOrg = null;
  }
}
