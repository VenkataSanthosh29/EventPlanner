import { Component, OnInit, HostBinding } from '@angular/core';
import { Router } from '@angular/router';

import { StaffService } from '../../services/staff.service';
import { Task } from '../../models/task.model';

type StaffTab = 'tasks';

@Component({
  selector: 'app-staff-dashboard',
  templateUrl: './staff-dashboard.component.html',
  styleUrls: ['./staff-dashboard.component.css']
})
export class StaffDashboardComponent implements OnInit {

  // ✅ Theme applied on component host (no wrapper needed)
  @HostBinding('class') hostThemeClass = 'night';
  currentTheme: 'day' | 'night' = 'night';

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
    // ✅ Theme init (does NOT affect business logic)
    this.initTheme();

    const id = localStorage.getItem('user_id');
    if (!id) {
      this.router.navigate(['/login']);
      return;
    }

    this.staffId = Number(id);
    this.username = localStorage.getItem('username') || 'Staff';

    this.loadTasks();
  }

  // ✅ Theme helpers (ADD only)
  private initTheme(): void {
    const saved = (localStorage.getItem('dashboard_theme') || 'night') as 'day' | 'night';
    this.currentTheme = saved === 'day' ? 'day' : 'night';
    this.hostThemeClass = this.currentTheme;
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'night' ? 'day' : 'night';
    this.hostThemeClass = this.currentTheme;
    localStorage.setItem('dashboard_theme', this.currentTheme);
  }

  setTab(tab: StaffTab): void {
    this.activeTab = tab;
    if (tab === 'tasks') this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;

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

 updateStatus(task: Task, status: string): void {
  if (!task?.id) return;

  // Optimistic UI update so buttons change immediately
  const prev = task.status;
  task.status = status;

  this.staffService.updateTaskStatus(task.id, status).subscribe({
    next: () => this.loadTasks(),
    error: () => {
      // rollback if failed
      task.status = prev;
    }
  });
}

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/home']);
  }
}