// agency-manager-frontend/src/app/sprints/sprint-create-modal.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sprint-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sprint-create-modal.html',
  styleUrls: ['./sprint-create-modal.scss']
})
export class SprintCreateModalComponent {
  @Output() sprintCreated = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();
  
  sprintForm: FormGroup;
  isOpen = false;

  constructor(private fb: FormBuilder) {
    this.sprintForm = this.fb.group({
      name: ['', Validators.required],
      goal: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  open() {
    this.isOpen = true;
    this.sprintForm.reset();
    // Set default dates (today and +14 days)
    const today = new Date();
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);
    
    this.sprintForm.patchValue({
      startDate: this.formatDate(today),
      endDate: this.formatDate(twoWeeksLater)
    });
  }

  closeModal() {
    this.isOpen = false;
    this.close.emit();
  }

  onSubmit() {
    if (this.sprintForm.valid) {
      this.sprintCreated.emit(this.sprintForm.value);
      this.closeModal();
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}