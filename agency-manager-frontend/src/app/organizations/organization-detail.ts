import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ClientListComponent } from '../clients/client-list';

type OrgTab = 'clients' | 'members' | 'invitations' | 'requests';

@Component({
  selector: 'app-organization-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ClientListComponent, RouterModule],
  templateUrl: './organization-detail.html',
  styleUrls: ['./organization-detail.scss']
})
export class OrganizationDetailComponent implements OnInit {
  orgId = '';
  orgName = '';
  activeTab: OrgTab = 'clients';
  members: any[] = [];
  invitations: any[] = [];
  accessRequests: any[] = [];
  userRole = '';
  newMemberEmail = '';
  newMemberRole = 'member';
  inviteEmail = '';
  inviteRole = 'member';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Get route parameters synchronously for immediate loading
    this.orgId = this.route.snapshot.paramMap.get('orgId') || '';
    this.orgName = this.route.snapshot.paramMap.get('orgName') || '';
    
    // Load all data immediately
    this.loadMembers();
    this.loadInvitations();
    this.loadAccessRequests();
    
    // Also subscribe to param changes for navigation
    this.route.paramMap.subscribe(params => {
      const newOrgId = params.get('orgId') || '';
      const newOrgName = params.get('orgName') || '';
      
      // Only reload if parameters actually changed
      if (newOrgId !== this.orgId || newOrgName !== this.orgName) {
        this.orgId = newOrgId;
        this.orgName = newOrgName;
        this.loadMembers();
        this.loadInvitations();
        this.loadAccessRequests();
      }
    });
  }

  setActiveTab(tab: OrgTab) {
    this.activeTab = tab;
  }

  loadMembers() {
    this.http.get<any[]>(`${environment.apiUrl}/orgs/${this.orgId}/members`)
      .subscribe({
        next: (members) => {
          this.members = members;
          const currentUserId = localStorage.getItem('userId');
          const currentMember = members.find(m => m.userId === currentUserId);
          this.userRole = currentMember?.role || '';
        },
        error: (err) => console.error('Failed to load members', err)
      });
  }

  addMember() {
    if (!this.newMemberEmail.trim()) {
      this.errorMessage = 'Please enter an email address';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.http.post(`${environment.apiUrl}/orgs/${this.orgId}/members`, {
      email: this.newMemberEmail,
      role: this.newMemberRole
    }).subscribe({
      next: (member) => {
        this.members.push(member);
        this.newMemberEmail = '';
        this.newMemberRole = 'member';
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Failed to add member';
        this.loading = false;
      }
    });
  }

  removeMember(member: any) {
    if (!confirm(`Remove ${member.email} from this organization?`)) return;

    this.http.delete(`${environment.apiUrl}/orgs/${this.orgId}/members/${member.userId}`)
      .subscribe({
        next: () => {
          this.members = this.members.filter(m => m._id !== member._id);
        },
        error: (err) => alert('Failed to remove member')
      });
  }

  isAdmin(): boolean {
    return this.userRole === 'org_admin';
  }

  sendInvitation() {
    if (!this.inviteEmail.trim()) {
      this.errorMessage = 'Please enter an email address';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post<any>(`${environment.apiUrl}/orgs/${this.orgId}/invitations`, {
      email: this.inviteEmail,
      role: this.inviteRole
    }).subscribe({
      next: (invitation) => {
        this.successMessage = `Invitation sent to ${invitation.email}`;
        this.invitations.push(invitation);
        this.inviteEmail = '';
        this.inviteRole = 'member';
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Failed to send invitation';
        this.loading = false;
      }
    });
  }

  loadInvitations() {
    this.http.get<any[]>(`${environment.apiUrl}/orgs/${this.orgId}/invitations`)
      .subscribe({
        next: (invitations) => {
          this.invitations = invitations;
        },
        error: (err) => console.error('Failed to load invitations', err)
      });
  }

  loadAccessRequests() {
    this.http.get<any[]>(`${environment.apiUrl}/orgs/${this.orgId}/access-requests`)
      .subscribe({
        next: (requests) => {
          this.accessRequests = requests;
        },
        error: (err) => console.error('Failed to load access requests', err)
      });
  }

  respondToRequest(request: any, action: 'approve' | 'reject') {
    const role = action === 'approve' ? 'member' : undefined;
    
    this.http.post(`${environment.apiUrl}/orgs/${this.orgId}/access-requests/${request._id}`, {
      action,
      role
    }).subscribe({
      next: () => {
        this.accessRequests = this.accessRequests.filter(r => r._id !== request._id);
        if (action === 'approve') {
          this.loadMembers();
        }
      },
      error: (err) => alert('Failed to respond to request')
    });
  }

  copyInviteLink(invitation: any) {
    const link = `${window.location.origin}/auth/register?invite=${invitation.token}`;
    navigator.clipboard.writeText(link).then(() => {
      this.successMessage = 'Invite link copied to clipboard!';
      setTimeout(() => this.successMessage = '', 3000);
    });
  }
}
