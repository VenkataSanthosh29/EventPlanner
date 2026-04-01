import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { StaffService } from '../../services/staff.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-staff-dashboard',
  templateUrl: './staff-dashboard.component.html',
  styleUrls: ['./staff-dashboard.component.css']
})
export class StaffDashboardComponent implements OnInit {

  staffId!: number;
  tasks: Task[] = [];

  // Track which task is being updated
  editingTaskId: number | null = null;

  // Reactive form for status update
  statusForm!: FormGroup;

  constructor(
    private staffService: StaffService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = localStorage.getItem('user_id');
    if (!id) {
      this.router.navigate(['/login']);
      return;
    }

    this.staffId = Number(id);

    this.statusForm = this.fb.group({
      status: ['', Validators.required]
    });

    this.loadAssignedTasks();
  }

  // ✅ Load tasks assigned to this staff
  loadAssignedTasks(): void {
    this.staffService
      .getAssignedTasks(this.staffId)
      .subscribe(tasks => this.tasks = tasks);
  }

  // ✅ Enable edit mode for a task
  editTask(task: Task): void {
    if (task.status === 'Completed') return;

    this.editingTaskId = task.id!;
    this.statusForm.patchValue({
      status: task.status
    });
  }

  // ✅ Update status
  updateStatus(): void {
    if (this.statusForm.invalid || !this.editingTaskId) return;

    const { status } = this.statusForm.value;

    this.staffService
      .updateTaskStatus(this.editingTaskId, status)
      .subscribe(() => {
        this.cancelEdit();
        this.loadAssignedTasks();
      });
  }

  // ✅ Cancel editing
  cancelEdit(): void {
    this.editingTaskId = null;
    this.statusForm.reset();
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}