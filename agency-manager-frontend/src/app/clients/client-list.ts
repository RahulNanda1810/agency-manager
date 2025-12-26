import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../core/services/client.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './client-list.html',
  styleUrls: ['./client-list.scss']
})
export class ClientListComponent {
  @Input() orgId: string = '';
  clients: any[] = [];
  createClientForm: FormGroup;
  loading = false;
  error = '';
  selectedClient: any = null;
  editingClient: any = null;
  editClientForm: FormGroup;

  constructor(private clientService: ClientService, private fb: FormBuilder, private cdr: ChangeDetectorRef, private router: Router) {
    this.createClientForm = this.fb.group({
      name: ['', Validators.required]
    });
    this.editClientForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.orgId) {
      this.loadClients();
    }
  }
  ngOnChanges() {
    if (this.orgId) {
      this.loadClients();
    }
  }

  loadClients() {
    console.log('Loading clients for orgId:', this.orgId);
    this.loading = true;
    this.clientService.getClients(this.orgId).subscribe({
      next: (res: any) => {
        console.log('Clients received:', res);
        this.clients = Array.isArray(res) ? res : (res.data || []);
        console.log('Filtered clients:', this.clients);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load clients:', err);
        this.error = 'Failed to load clients.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  createClient() {
    if (this.createClientForm.invalid) return;
    console.log('Creating client for orgId:', this.orgId, 'with data:', this.createClientForm.value);
    this.loading = true;
    this.clientService.createClient(this.orgId, this.createClientForm.value).subscribe({
      next: client => {
        console.log('Client created:', client);
        this.clients.push(client);
        this.createClientForm.reset();
        this.loading = false;
      },
      error: err => {
        console.error('Failed to create client:', err);
        this.error = 'Failed to create client.';
        this.loading = false;
      }
    });
  }

  startEdit(client: any) {
    this.editingClient = client;
    this.editClientForm.setValue({ name: client.name });
  }

  cancelEdit() {
    this.editingClient = null;
    this.editClientForm.reset();
  }

  updateClient() {
    if (!this.editingClient || this.editClientForm.invalid) return;
    this.loading = true;
    this.clientService.updateClient(this.editingClient._id, this.orgId, this.editClientForm.value).subscribe({
      next: updated => {
        const idx = this.clients.findIndex(c => c._id === this.editingClient._id);
        if (idx > -1) this.clients[idx] = updated;
        this.cancelEdit();
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to update client.';
        this.loading = false;
      }
    });
  }

  deleteClient(client: any) {
    if (!confirm('Delete this client?')) return;
    this.loading = true;
    this.clientService.deleteClient(client._id, this.orgId).subscribe({
      next: () => {
        this.clients = this.clients.filter(c => c._id !== client._id);
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to delete client.';
        this.loading = false;
      }
    });
  }

  goToClient(client: any) {
    this.router.navigate(['/organizations', this.orgId, 'clients', client._id]);
  }
}
