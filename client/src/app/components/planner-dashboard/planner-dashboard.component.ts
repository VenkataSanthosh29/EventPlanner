import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { PlannerService } from '../../services/planner.service';
import { StaffService } from '../../services/staff.service';

import { Event } from '../../models/event.model';
import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-planner-dashboard',
  templateUrl: './planner-dashboard.component.html',
  styleUrls: ['./planner-dashboard.component.css']
})
export class PlannerDashboardComponent implements OnInit {

  plannerId!: number;

  showEvents = true;
  showTasks = false;

  events: Event[] = [];
  tasks: Task[] = [];
  staffs: User[] = [];

  eventForm!: FormGroup;
  taskForm!: FormGroup;

  editingEventId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private plannerService: PlannerService,
    private staffService: StaffService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = localStorage.getItem('user_id');
    if (!id) {
      this.router.navigate(['/login']);
      return;
    }

    this.plannerId = Number(id);

    this.initForms();
    this.loadEvents();
    this.loadTasks();
    this.loadStaffs();
  }

  initForms(): void {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required],
      status: ['', Validators.required]
    });

    this.taskForm = this.fb.group({
      description: ['', Validators.required],
      status: ['', Validators.required],
      staffId: ['', Validators.required]
    });
  }

  navigateTo(section: 'events' | 'tasks'): void {
    this.showEvents = section === 'events';
    this.showTasks = section === 'tasks';
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  /* ---------- EVENTS ---------- */

  loadEvents(): void {
    this.plannerService
      .getEventsByPlanner(this.plannerId)
      .subscribe(data => this.events = data);
  }

  submitEvent(): void {
    if (this.eventForm.invalid) return;

    const eventData: Event = this.eventForm.value;

    if (this.editingEventId) {
      this.plannerService
        .updateEvent(this.editingEventId, eventData)
        .subscribe(() => {
          this.resetEventForm();
          this.loadEvents();
        });
    } else {
      this.plannerService
        .createEvent(this.plannerId, eventData)
        .subscribe(() => {
          this.resetEventForm();
          this.loadEvents();
        });
    }
  }

  editEvent(event: Event): void {
  if (event.status === 'Completed') return;

  this.editingEventId = event.id!;

  this.eventForm.patchValue({
    title: event.title,
    location: event.location,
    description: event.description,
    status: event.status,
    date: event.date ? event.date.substring(0, 16) : ''
  });
}
  resetEventForm(): void {
    this.editingEventId = null;
    this.eventForm.reset();
  }

  /* ---------- TASKS (NO EDIT) ---------- */

  loadTasks(): void {
    this.plannerService
      .getAllTasks()
      .subscribe(data => this.tasks = data);
  }

  submitTask(): void {
    if (this.taskForm.invalid) return;

    const { description, status, staffId } = this.taskForm.value;
    const taskPayload: Task = { description, status };

    this.plannerService.createTask(taskPayload).subscribe(created => {
      this.plannerService
        .assignTaskToStaff(created.id!, staffId)
        .subscribe(() => {
          this.taskForm.reset();
          this.loadTasks();
        });
    });
  }

  /* ---------- STAFF ---------- */

  loadStaffs(): void {
    this.staffService
      .getAllStaff()
      .subscribe(data => this.staffs = data);
  }
}

