// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';

// import { PlannerService } from '../../services/planner.service';
// import { StaffService } from '../../services/staff.service';

// import { Event } from '../../models/event.model';
// import { Task } from '../../models/task.model';
// import { User } from '../../models/user.model';
// import { EventRequest } from '../../models/event-request.model';

// @Component({
//   selector: 'app-planner-dashboard',
//   templateUrl: './planner-dashboard.component.html',
//   styleUrls: ['./planner-dashboard.component.css']
// })
// export class PlannerDashboardComponent implements OnInit {

//   plannerId!: number;
//   username!: string;

//   showEvents = false;
//   showTasks = false;
//   showRequests = false;

//   events: Event[] = [];
//   tasks: Task[] = [];
//   staffs: User[] = [];

//   // ✅ NEW: Requests list
//   requests: EventRequest[] = [];
//   requestsLoading = false;

//   eventForm!: FormGroup;
//   taskForm!: FormGroup;

//   editingEventId: number | null = null;

//   // ✅ Predefined event types
//   eventTypes: string[] = [
//     'Birthday',
//     'Wedding',
//     'Corporate',
//     'Concerts',
//     'Social Gatherings',
//     'Cultural',
//     'Sports',
//     'Webinars',
//     'Fundraisers',
//     'Others'
//   ];

//   // ✅ Common tasks per event type
//   commonTasksMap: Record<string, string[]> = {
//     Birthday: ['Book venue', 'Cake order', 'Decorations', 'Guest invitations', 'Photography'],
//     Wedding: ['Venue booking', 'Catering', 'Decoration', 'Photography', 'Music/DJ', 'Makeup'],
//     Corporate: ['Agenda preparation', 'Speaker coordination', 'Venue setup', 'AV setup', 'Refreshments'],
//     Concerts: ['Stage setup', 'Sound check', 'Lighting', 'Security', 'Ticketing'],
//     'Social Gatherings': ['Venue booking', 'Decor setup', 'Food arrangements', 'Invite guests'],
//     Cultural: ['Stage arrangement', 'Costumes', 'Props', 'Sound & lighting', 'Chief guest'],
//     Sports: ['Ground booking', 'Equipment', 'Referee', 'Medical support', 'Refreshments'],
//     Webinars: ['Speaker invite', 'Meeting link', 'Poster', 'Dry run', 'Recording'],
//     Fundraisers: ['Sponsor outreach', 'Promotion', 'Donation link', 'Venue setup', 'Accounting']
//   };

//   // ✅ Template task UI state
//   selectedEventType: string = '';
//   templateTasks: string[] = [];

//   // checkbox: taskName -> true/false
//   selectedTemplateTasks: Record<string, boolean> = {};

//   // ✅ staff mapping per template task: taskName -> staffId
//   templateTaskStaff: Record<string, number | ''> = {};

//   constructor(
//     private fb: FormBuilder,
//     private plannerService: PlannerService,
//     private staffService: StaffService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     const id = localStorage.getItem('user_id');
//     if (!id) {
//       this.router.navigate(['/login']);
//       return;
//     }

//     this.username = localStorage.getItem('username') || 'User';
//     this.plannerId = Number(id);

//     this.initForms();
//     this.loadEvents();
//     this.loadTasks();
//     this.loadStaffs();

//     // ✅ Others -> customEventType required
//     this.eventForm.get('eventTypePreset')?.valueChanges.subscribe((val: string) => {
//       const customCtrl = this.eventForm.get('customEventType');
//       if (!customCtrl) return;

//       if (val === 'Others') {
//         customCtrl.setValidators([Validators.required]);
//       } else {
//         customCtrl.clearValidators();
//         customCtrl.setValue('');
//       }
//       customCtrl.updateValueAndValidity();
//     });

//     // ✅ When event changes in task form: update templates and reset selections
//     this.taskForm.get('eventId')?.valueChanges.subscribe((eventId: any) => {
//       const selected = this.events.find(e => e.id === Number(eventId));
//       const type = (selected?.eventType || 'Others').trim();

//       this.selectedEventType = type;
//       this.templateTasks = this.commonTasksMap[type] ? [...this.commonTasksMap[type]] : [];

//       // reset selections and per-task staff mapping
//       this.selectedTemplateTasks = {};
//       this.templateTaskStaff = {};

//       this.templateTasks.forEach(t => {
//         this.selectedTemplateTasks[t] = false;
//         this.templateTaskStaff[t] = '';
//       });
//     });
//   }

//   initForms(): void {
//     // ✅ Event form: includes preset + custom event type
//     this.eventForm = this.fb.group({
//       title: ['', Validators.required],
//       date: ['', Validators.required],
//       location: ['', Validators.required],
//       description: ['', Validators.required],
//       status: ['', Validators.required],

//       eventTypePreset: ['', Validators.required],
//       customEventType: ['']
//     });

//     // ✅ Task form: event required; custom task uses staffId+description
//     // status fixed to INITIATED (planner rule)
//     this.taskForm = this.fb.group({
//       eventId: ['', Validators.required],

//       staffId: ['', Validators.required], // used for custom task
//       description: ['', Validators.required], // custom task name
//       status: [{ value: 'INITIATED', disabled: true }, Validators.required]
//     });
//   }

//   // ✅ Navigation updated: events/tasks/requests
//   navigateTo(section: 'events' | 'tasks' | 'requests'): void {
//     this.showEvents = section === 'events';
//     this.showTasks = section === 'tasks';
//     this.showRequests = section === 'requests';

//     // Load requests when opening requests tab
//     if (section === 'requests') {
//       this.loadRequests();
//     }
//   }

//   logout(): void {
//     localStorage.clear();
//     this.router.navigate(['/login']);
//   }

//   // ---------- EVENTS ----------
//   loadEvents(): void {
//     this.plannerService.getEventsByPlanner(this.plannerId)
//       .subscribe(data => this.events = data);
//   }

//   submitEvent(): void {
//     if (this.eventForm.invalid) return;

//     const preset = this.eventForm.value.eventTypePreset;
//     const custom = this.eventForm.value.customEventType;
//     const finalType = preset === 'Others' ? (custom || '').trim() : preset;

//     const payload: Event = {
//       title: this.eventForm.value.title,
//       date: this.eventForm.value.date,
//       location: this.eventForm.value.location,
//       description: this.eventForm.value.description,
//       status: this.eventForm.value.status,
//       eventType: finalType
//     };

//     if (this.editingEventId) {
//       this.plannerService.updateEvent(this.editingEventId, payload).subscribe(() => {
//         this.resetEventForm();
//         this.loadEvents();
//       });
//     } else {
//       this.plannerService.createEvent(this.plannerId, payload).subscribe(() => {
//         this.resetEventForm();
//         this.loadEvents();
//       });
//     }
//   }

//   editEvent(event: Event): void {
//     if (event.status === 'COMPLETED') return;

//     this.editingEventId = event.id!;

//     const existingType = (event.eventType || '').trim();
//     const isPreset = this.eventTypes.includes(existingType);
//     const preset = isPreset ? existingType : 'Others';
//     const custom = isPreset ? '' : existingType;

//     this.eventForm.patchValue({
//       title: event.title,
//       date: (event.date as any) ? (event.date as any).substring?.(0, 16) : '', // safe for string/ISO
//       location: event.location,
//       description: event.description,
//       status: event.status,
//       eventTypePreset: preset,
//       customEventType: custom
//     });
//   }

//   resetEventForm(): void {
//     this.editingEventId = null;
//     this.eventForm.reset();
//   }

//   // ---------- TASKS ----------
//   loadTasks(): void {
//     this.plannerService.getAllTasks()
//       .subscribe(data => this.tasks = data);
//   }

//   hasSelectedTemplateTasks(): boolean {
//     return Object.values(this.selectedTemplateTasks || {}).some(v => v === true);
//   }

//   canCreateTemplateTasks(): boolean {
//     const eventInvalid = !!(this.taskForm.get('eventId')?.invalid);
//     if (eventInvalid) return false;

//     const selected = Object.keys(this.selectedTemplateTasks).filter(t => this.selectedTemplateTasks[t]);
//     if (selected.length === 0) return false;

//     return selected.every(taskName => {
//       const staffId = this.templateTaskStaff[taskName];
//       return staffId !== '' && staffId !== undefined && staffId !== null;
//     });
//   }

//   // Custom single task (requires staffId + description)
//   submitTask(): void {
//     if (this.taskForm.invalid) return;

//     const eventId = Number(this.taskForm.get('eventId')?.value);
//     const staffId = Number(this.taskForm.get('staffId')?.value);
//     const description = (this.taskForm.get('description')?.value || '').trim();

//     if (!eventId || !staffId || !description) return;

//     const taskPayload: Partial<Task> = { description, status: 'INITIATED' };

//     this.plannerService.createTaskForEvent(eventId, taskPayload).subscribe(created => {
//       this.plannerService.assignTaskToStaff(created.id!, staffId).subscribe(() => {
//         this.taskForm.patchValue({ description: '' });
//         this.loadTasks();
//       });
//     });
//   }

//   // Multi template tasks with different staff per task
//   createTemplateTasks(): void {
//     if (!this.canCreateTemplateTasks()) return;

//     const eventId = Number(this.taskForm.get('eventId')?.value);
//     const selected = Object.keys(this.selectedTemplateTasks).filter(t => this.selectedTemplateTasks[t]);

//     selected.forEach(taskName => {
//       const staffId = Number(this.templateTaskStaff[taskName]);

//       const payload: Partial<Task> = { description: taskName, status: 'INITIATED' };

//       this.plannerService.createTaskForEvent(eventId, payload).subscribe(created => {
//         this.plannerService.assignTaskToStaff(created.id!, staffId).subscribe(() => {
//           this.loadTasks();
//         });
//       });
//     });

//     selected.forEach(t => {
//       this.selectedTemplateTasks[t] = false;
//       this.templateTaskStaff[t] = '';
//     });
//   }

//   // ---------- STAFF ----------
//   loadStaffs(): void {
//     this.staffService.getAllStaff()
//       .subscribe(data => this.staffs = data);
//   }

//   // ---------- REQUESTS ----------
//   loadRequests(): void {
//     this.requestsLoading = true;
//     this.plannerService.getRequests(this.plannerId).subscribe({
//       next: (data: EventRequest[]) => {
//         this.requests = data;
//         this.requestsLoading = false;
//       },
//       error: () => {
//         this.requestsLoading = false;
//       }
//     });
//   }

//   acceptRequest(requestId: number): void {
//     this.plannerService.acceptRequest(requestId).subscribe(() => {
//       // accepting creates an event -> refresh events + requests
//       this.loadRequests();
//       this.loadEvents();
//     });
//   }

//   rejectRequest(requestId: number): void {
//     this.plannerService.rejectRequest(requestId).subscribe(() => {
//       this.loadRequests();
//     });
//   }

//   // ---------- Display helpers ----------
//   formatStatus(status: string): string {
//     if (status === 'INITIATED') return 'Initiated';
//     if (status === 'IN_PROGRESS') return 'In Progress';
//     if (status === 'COMPLETED') return 'Completed';
//     return status;
//   }

//   formatRequestStatus(status: string): string {
//     if (status === 'PENDING') return 'Pending';
//     if (status === 'ACCEPTED') return 'Accepted';
//     if (status === 'REJECTED') return 'Rejected';
//     return status;
//   }
// }

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { PlannerService } from '../../services/planner.service';
import { StaffService } from '../../services/staff.service';

import { Event } from '../../models/event.model';
import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';
import { EventRequest } from '../../models/event-request.model';

type PlannerTab = 'events' | 'tasks' | 'requests' | 'profile';

@Component({
  selector: 'app-planner-dashboard',
  templateUrl: './planner-dashboard.component.html',
  styleUrls: ['./planner-dashboard.component.css']
})
export class PlannerDashboardComponent implements OnInit {

  plannerId!: number;
  username!: string;

  activeTab: PlannerTab = 'events';

  events: Event[] = [];
  tasks: Task[] = [];
  staffs: User[] = [];

  // Requests
  requests: EventRequest[] = [];
  requestsLoading = false;

  // Profile
  plannerProfile: any | null = null;
  profileLoading = false;

  // Forms
  eventForm!: FormGroup;
  taskForm!: FormGroup;
  editingEventId: number | null = null;

  // Event types
  eventTypes: string[] = [
    'Birthday', 'Wedding', 'Corporate', 'Concerts', 'Social Gatherings',
    'Cultural', 'Sports', 'Webinars', 'Fundraisers', 'Others'
  ];

  // Templates
  commonTasksMap: Record<string, string[]> = {
    Birthday: ['Book venue', 'Cake order', 'Decorations', 'Guest invitations', 'Photography'],
    Wedding: ['Venue booking', 'Catering', 'Decoration', 'Photography', 'Music/DJ', 'Makeup'],
    Corporate: ['Agenda preparation', 'Speaker coordination', 'Venue setup', 'AV setup', 'Refreshments'],
    Concerts: ['Stage setup', 'Sound check', 'Lighting', 'Security', 'Ticketing'],
    'Social Gatherings': ['Venue booking', 'Decor setup', 'Food arrangements', 'Invite guests'],
    Cultural: ['Stage arrangement', 'Costumes', 'Props', 'Sound & lighting', 'Chief guest'],
    Sports: ['Ground booking', 'Equipment', 'Referee', 'Medical support', 'Refreshments'],
    Webinars: ['Speaker invite', 'Meeting link', 'Poster', 'Dry run', 'Recording'],
    Fundraisers: ['Sponsor outreach', 'Promotion', 'Donation link', 'Venue setup', 'Accounting']
  };

  selectedEventType: string = '';
  templateTasks: string[] = [];
  selectedTemplateTasks: Record<string, boolean> = {};
  templateTaskStaff: Record<string, number | ''> = {};

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
    this.username = localStorage.getItem('username') || 'User';

    this.initForms();
    this.loadEvents();
    this.loadTasks();
    this.loadStaffs();

    // Others -> customEventType required
    this.eventForm.get('eventTypePreset')?.valueChanges.subscribe((val: string) => {
      const customCtrl = this.eventForm.get('customEventType');
      if (!customCtrl) return;

      if (val === 'Others') {
        customCtrl.setValidators([Validators.required]);
      } else {
        customCtrl.clearValidators();
        customCtrl.setValue('');
      }
      customCtrl.updateValueAndValidity();
    });

    // When event changes in task form -> update templates
    this.taskForm.get('eventId')?.valueChanges.subscribe((eventId: any) => {
      const selected = this.events.find(e => e.id === Number(eventId));
      const type = (selected?.eventType || 'Others').trim();

      this.selectedEventType = type;
      this.templateTasks = this.commonTasksMap[type] ? [...this.commonTasksMap[type]] : [];

      this.selectedTemplateTasks = {};
      this.templateTaskStaff = {};
      this.templateTasks.forEach(t => {
        this.selectedTemplateTasks[t] = false;
        this.templateTaskStaff[t] = '';
      });
    });
  }

  setTab(tab: PlannerTab): void {
    this.activeTab = tab;

    if (tab === 'requests') this.loadRequests();
    if (tab === 'profile') this.loadProfile();
  }

  initForms(): void {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required],
      status: ['', Validators.required],

      eventTypePreset: ['', Validators.required],
      customEventType: ['']
    });

    this.taskForm = this.fb.group({
      eventId: ['', Validators.required],

      // Custom task uses staffId+description
      staffId: ['', Validators.required],
      description: ['', Validators.required],

      // Planner creates INITIATED only
      status: [{ value: 'INITIATED', disabled: true }, Validators.required]
    });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  // ---------- EVENTS ----------
  loadEvents(): void {
    this.plannerService.getEventsByPlanner(this.plannerId)
      .subscribe(data => this.events = data);
  }

  submitEvent(): void {
    if (this.eventForm.invalid) return;

    const preset = this.eventForm.value.eventTypePreset;
    const custom = this.eventForm.value.customEventType;
    const finalType = preset === 'Others' ? (custom || '').trim() : preset;

    const payload: Event = {
      title: this.eventForm.value.title,
      date: this.eventForm.value.date,
      location: this.eventForm.value.location,
      description: this.eventForm.value.description,
      status: this.eventForm.value.status,
      eventType: finalType
    };

    if (this.editingEventId) {
      this.plannerService.updateEvent(this.editingEventId, payload).subscribe(() => {
        this.resetEventForm();
        this.loadEvents();
      });
    } else {
      this.plannerService.createEvent(this.plannerId, payload).subscribe(() => {
        this.resetEventForm();
        this.loadEvents();
      });
    }
  }

  editEvent(event: Event): void {
    if (event.status === 'COMPLETED') return;

    this.editingEventId = event.id || null;

    const existingType = (event.eventType || '').trim();
    const isPreset = this.eventTypes.includes(existingType);
    const preset = isPreset ? existingType : 'Others';
    const custom = isPreset ? '' : existingType;

    this.eventForm.patchValue({
      title: event.title,
      date: (event.date as any)?.substring ? (event.date as any).substring(0, 16) : '',
      location: event.location,
      description: event.description,
      status: event.status,
      eventTypePreset: preset,
      customEventType: custom
    });
  }

  resetEventForm(): void {
    this.editingEventId = null;
    this.eventForm.reset();
  }

  // ---------- TASKS ----------
  loadTasks(): void {
    this.plannerService.getAllTasks().subscribe(data => this.tasks = data);
  }

  loadStaffs(): void {
    this.staffService.getAllStaff().subscribe(data => this.staffs = data);
  }

  hasSelectedTemplateTasks(): boolean {
    return Object.values(this.selectedTemplateTasks || {}).some(v => v === true);
  }

  canCreateTemplateTasks(): boolean {
    const eventInvalid = !!(this.taskForm.get('eventId')?.invalid);
    if (eventInvalid) return false;

    const selected = Object.keys(this.selectedTemplateTasks).filter(t => this.selectedTemplateTasks[t]);
    if (selected.length === 0) return false;

    return selected.every(taskName => {
      const staffId = this.templateTaskStaff[taskName];
      return staffId !== '' && staffId !== undefined && staffId !== null;
    });
  }

  submitTask(): void {
    if (this.taskForm.invalid) return;

    const eventId = Number(this.taskForm.get('eventId')?.value);
    const staffId = Number(this.taskForm.get('staffId')?.value);
    const description = (this.taskForm.get('description')?.value || '').trim();

    if (!eventId || !staffId || !description) return;

    const payload: Partial<Task> = { description, status: 'INITIATED' };

    this.plannerService.createTaskForEvent(eventId, payload).subscribe(created => {
      this.plannerService.assignTaskToStaff(created.id!, staffId).subscribe(() => {
        this.taskForm.patchValue({ description: '' });
        this.loadTasks();
      });
    });
  }

  createTemplateTasks(): void {
    if (!this.canCreateTemplateTasks()) return;

    const eventId = Number(this.taskForm.get('eventId')?.value);
    const selected = Object.keys(this.selectedTemplateTasks).filter(t => this.selectedTemplateTasks[t]);

    selected.forEach(taskName => {
      const staffId = Number(this.templateTaskStaff[taskName]);
      const payload: Partial<Task> = { description: taskName, status: 'INITIATED' };

      this.plannerService.createTaskForEvent(eventId, payload).subscribe(created => {
        this.plannerService.assignTaskToStaff(created.id!, staffId).subscribe(() => this.loadTasks());
      });
    });

    selected.forEach(t => {
      this.selectedTemplateTasks[t] = false;
      this.templateTaskStaff[t] = '';
    });
  }

  // ---------- REQUESTS ----------
  loadRequests(): void {
    this.requestsLoading = true;
    this.plannerService.getRequests(this.plannerId).subscribe({
      next: (data: EventRequest[]) => {
        this.requests = data;
        this.requestsLoading = false;
      },
      error: () => this.requestsLoading = false
    });
  }

  acceptRequest(requestId: number): void {
    this.plannerService.acceptRequest(requestId).subscribe(() => {
      this.loadRequests();
      this.loadEvents();
    });
  }

  rejectRequest(requestId: number): void {
    this.plannerService.rejectRequest(requestId).subscribe(() => this.loadRequests());
  }

  // ---------- PROFILE ----------
  loadProfile(): void {
    if (this.profileLoading) return;
    this.profileLoading = true;

    this.plannerService.getPlannerProfile(this.plannerId).subscribe({
      next: (p: any) => {
        this.plannerProfile = p;
        this.profileLoading = false;
      },
      error: () => this.profileLoading = false
    });
  }

  // ---------- Display helpers ----------
  formatStatus(status: string): string {
    if (status === 'INITIATED') return 'Initiated';
    if (status === 'IN_PROGRESS') return 'In Progress';
    if (status === 'COMPLETED') return 'Completed';
    return status;
  }

  formatRequestStatus(status: string): string {
    if (status === 'PENDING') return 'Pending';
    if (status === 'ACCEPTED') return 'Accepted';
    if (status === 'REJECTED') return 'Rejected';
    return status;
  }
}