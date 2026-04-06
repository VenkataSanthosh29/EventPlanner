import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { StaffService } from '../../services/staff.service';
import { Task } from '../../models/task.model';

type StaffTab = 'tasks'; // ✅ Only one tab now (extend later if you want)

@Component({
  selector: 'app-staff-dashboard',
  templateUrl: './staff-dashboard.component.html',
  styleUrls: ['./staff-dashboard.component.css']
})
export class StaffDashboardComponent implements OnInit {

  staffId!: number;
  username!: string;

  activeTab: StaffTab = 'tasks';

  tasks: Task[] = [];
  loading = false;

  constructor(
    private staffService: StaffService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = localStorage.getItem('user_id');
    if (!id) {
      this.router.navigate(['/login']);
      return;
    }

    this.staffId = Number(id);
    this.username = localStorage.getItem('username') || 'Staff';

    this.loadTasks();
  }

  setTab(tab: StaffTab): void {
    this.activeTab = tab;
    if (tab === 'tasks') this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;

    // ✅ Replace with your actual API method name
    this.staffService.getAssignedTasks(this.staffId).subscribe({
      next: (data: Task[]) => {
        this.tasks = data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ✅ Optional: status updates (if you already support it)
  updateStatus(task: Task, status: string): void {
    if (!task?.id) return;

    this.staffService.updateTaskStatus(task.id, status).subscribe({
      next: () => this.loadTasks(),
      error: () => {}
    });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/home']);
  }
}