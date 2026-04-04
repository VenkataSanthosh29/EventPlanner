// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';

// import { StaffService } from '../../services/staff.service';
// import { Task } from '../../models/task.model';

// @Component({
//   selector: 'app-staff-dashboard',
//   templateUrl: './staff-dashboard.component.html',
//   styleUrls: ['./staff-dashboard.component.css']
// })
// export class StaffDashboardComponent implements OnInit {

//   staffId!: number;
//   tasks: Task[] = [];
//   username!:string;

//   // Track which task is being updated
//   editingTaskId: number | null = null;

//   // Reactive form for status update
//   statusForm!: FormGroup;

//   constructor(
//     private staffService: StaffService,
//     private fb: FormBuilder,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     const id = localStorage.getItem('user_id');
//     if (!id) {
//       this.router.navigate(['/login']);
//       return;
//     }
    
//     this.username = localStorage.getItem('username') || 'User';


//     this.staffId = Number(id);

//     this.statusForm = this.fb.group({
//       status: ['', Validators.required]
//     });

//     this.loadAssignedTasks();
//   }

//   // ✅ Load tasks assigned to this staff
//   loadAssignedTasks(): void {
//     this.staffService
//       .getAssignedTasks(this.staffId)
//       .subscribe(tasks => this.tasks = tasks);
//   }

//   // ✅ Enable edit mode for a task
//   editTask(task: Task): void {
//     if (task.status === 'Completed'||task.status==="COMPLETED") return;

//     this.editingTaskId = task.id!;
//     this.statusForm.patchValue({
//       status: task.status
//     });
//   }

//   // ✅ Update status
//   updateStatus(): void {
//     if (this.statusForm.invalid || !this.editingTaskId) return;

//     const { status } = this.statusForm.value;

//     this.staffService
//       .updateTaskStatus(this.editingTaskId, status)
//       .subscribe(() => {
//         this.cancelEdit();
//         this.loadAssignedTasks();
//       });
//   }

//   // ✅ Cancel editing
//   cancelEdit(): void {
//     this.editingTaskId = null;
//     this.statusForm.reset();
//   }

//   logout(): void {
//     localStorage.clear();
//     this.router.navigate(['/login']);
//   }
// }

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { StaffService } from '../../services/staff.service';
import { Task } from '../../models/task.model';

type StaffTab = 'tasks' | 'profile';

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
  editingTaskId: number | null = null;

  // ✅ Track current task status so we show only valid next steps
  currentTaskStatus: string | null = null;

  statusForm!: FormGroup;

  staffProfile: any | null = null;
  profileLoading = false;

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
    this.username = localStorage.getItem('username') || 'User';

    this.statusForm = this.fb.group({
      status: ['', Validators.required]
    });

    this.loadAssignedTasks();
  }

setTab(tab: StaffTab): void {
  this.activeTab = tab;

  this.cancelEdit();

  if (tab === 'profile') {
    this.loadProfile();
  }
}
  loadAssignedTasks(): void {
    this.staffService.getAssignedTasks(this.staffId)
      .subscribe(tasks => this.tasks = tasks);
  }

  // ✅ Returns allowed next statuses only (forward workflow)
  getNextStatusOptions(): { value: string; label: string }[] {
    if (this.currentTaskStatus === 'INITIATED') {
      return [{ value: 'IN_PROGRESS', label: 'In Progress' }];
    }
    if (this.currentTaskStatus === 'IN_PROGRESS') {
      return [{ value: 'COMPLETED', label: 'Completed' }];
    }
    return [];
  }

  editTask(task: Task): void {
    if (task.status === 'COMPLETED') return;

    this.editingTaskId = task.id!;
    this.currentTaskStatus = task.status;

    // ✅ Prefill ONLY valid next status (so Save works immediately)
    const options = this.getNextStatusOptions();
    const next = options.length > 0 ? options[0].value : '';

    this.statusForm.setValue({ status: next });
    this.statusForm.markAsPristine();
    this.statusForm.markAsUntouched();
  }

  updateStatus(): void {
    if (this.statusForm.invalid || !this.editingTaskId) return;

    const { status } = this.statusForm.value;

    this.staffService.updateTaskStatus(this.editingTaskId, status).subscribe(() => {
      this.cancelEdit();
      this.loadAssignedTasks();
    });
  }

  cancelEdit(): void {
    this.editingTaskId = null;
    this.currentTaskStatus = null;
    this.statusForm.reset();
  }

  loadProfile(): void {
    if (this.profileLoading) return;
    this.profileLoading = true;

    this.staffService.getStaffProfile(this.staffId).subscribe({
      next: (p: any) => {
        this.staffProfile = p;
        this.profileLoading = false;
      },
      error: () => this.profileLoading = false
    });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}