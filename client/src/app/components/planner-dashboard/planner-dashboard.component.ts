// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';

// import { PlannerService } from '../../services/planner.service';
// import { StaffService } from '../../services/staff.service';

// import { Event } from '../../models/event.model';
// import { Task } from '../../models/task.model';
// import { User } from '../../models/user.model';
// import { EventRequest } from '../../models/event-request.model';
// import { Payment } from '../../models/payment.model';

// import { finalize } from 'rxjs/operators';

// type PlannerTab = 'events' | 'tasks' | 'requests' | 'profile';
// type EventsViewMode = 'cards' | 'table';

// @Component({
//   selector: 'app-planner-dashboard',
//   templateUrl: './planner-dashboard.component.html',
//   styleUrls: ['./planner-dashboard.component.css']
// })
// export class PlannerDashboardComponent implements OnInit {

//   plannerId!: number;
//   username!: string;

//   activeTab: PlannerTab = 'events';

//   //  NEW: Table/Card view toggle
//   eventsViewMode: EventsViewMode = 'cards';

//   events: Event[] = [];
//   tasks: Task[] = [];
//   staffs: User[] = [];

//   // Requests
//   requests: EventRequest[] = [];
//   requestsLoading = false;

//   // Budget UI state (per request)
//   budgetInputs: Record<number, number> = {};
//   budgetLoading = false;

//   // Profile
//   plannerProfile: any | null = null;
//   profileLoading = false;

//   // Forms
//   eventForm!: FormGroup;
//   taskForm!: FormGroup;
//   editingEventId: number | null = null;

//   // Prevent double submit
//   creatingEvent = false;

//   // ✅ Payments (for Paid/Revenue)
//   plannerPayments: Payment[] = [];
//   paymentByEventId = new Map<number, Payment>();
//   paymentsLoading = false;

//   // Event types
//   eventTypes: string[] = [
//     'Birthday', 'Wedding', 'Corporate', 'Concerts', 'Social Gatherings',
//     'Cultural', 'Sports', 'Webinars', 'Fundraisers', 'Others'
//   ];

//   // Templates
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

//   selectedEventType: string = '';
//   templateTasks: string[] = [];
//   selectedTemplateTasks: Record<string, boolean> = {};
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

//     this.plannerId = Number(id);
//     this.username = localStorage.getItem('username') || 'User';

//     this.initForms();
//     this.loadEvents();
//     this.loadPlannerPayments();
//     this.loadTasks();
//     this.loadStaffs();

//     // Others -> customEventType required
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

//     // When event changes in task form -> update templates
//     this.taskForm.get('eventId')?.valueChanges.subscribe((eventId: any) => {
//       const selected = this.events.find(e => e.id === Number(eventId));
//       const type = (selected?.eventType || 'Others').trim();

//       this.selectedEventType = type;
//       this.templateTasks = this.commonTasksMap[type] ? [...this.commonTasksMap[type]] : [];

//       this.selectedTemplateTasks = {};
//       this.templateTaskStaff = {};
//       this.templateTasks.forEach(t => {
//         this.selectedTemplateTasks[t] = false;
//         this.templateTaskStaff[t] = '';
//       });
//     });
//   }

//   setTab(tab: PlannerTab): void {
//     this.activeTab = tab;

//     if (tab === 'requests') this.loadRequests();
//     if (tab === 'profile') this.loadProfile();
//     if (tab === 'events') {
//       this.loadEvents();
//       this.loadPlannerPayments();
//     }
//   }

//   toggleEventsView(mode: EventsViewMode): void {
//     this.eventsViewMode = mode;
//   }

//   initForms(): void {
//     this.eventForm = this.fb.group({
//       title: ['', Validators.required],
//       date: ['', Validators.required],
//       location: ['', Validators.required],
//       description: ['', Validators.required],
//       status: ['', Validators.required],
//       eventTypePreset: ['', Validators.required],
//       customEventType: ['']
//     });

//     this.taskForm = this.fb.group({
//       eventId: ['', Validators.required],
//       staffId: ['', Validators.required],
//       description: ['', Validators.required],
//       status: [{ value: 'INITIATED', disabled: true }, Validators.required]
//     });
//   }

//   logout(): void {
//     localStorage.clear();
//     this.router.navigate(['/home']);
//   }

//   // ---------- EVENTS ----------
//   loadEvents(): void {
//     this.plannerService.getEventsByPlanner(this.plannerId).subscribe({
//       next: (data) => {
//         this.events = data;
//         this.loadPlannerPayments(); // keep payment status fresh
//       },
//       error: () => {}
//     });
//   }

//   submitEvent(): void {
//     if (this.creatingEvent) return;

//     if (this.eventForm.invalid) {
//       this.eventForm.markAllAsTouched();
//       return;
//     }

//     this.creatingEvent = true;

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

//     const request$ = this.editingEventId
//       ? this.plannerService.updateEvent(this.editingEventId, payload)
//       : this.plannerService.createEvent(this.plannerId, payload);

//     request$
//       .pipe(finalize(() => (this.creatingEvent = false)))
//       .subscribe({
//         next: () => {
//           this.resetEventForm();
//           this.loadEvents();
//         },
//         error: () => {}
//       });
//   }

//   editEvent(event: Event): void {
//     if (event.status === 'COMPLETED') return;

//     this.editingEventId = event.id || null;

//     const existingType = (event.eventType || '').trim();
//     const isPreset = this.eventTypes.includes(existingType);
//     const preset = isPreset ? existingType : 'Others';
//     const custom = isPreset ? '' : existingType;

//     this.eventForm.patchValue({
//       title: event.title,
//       date: (event.date as any)?.substring ? (event.date as any).substring(0, 16) : '',
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

//   // ---------- PAYMENTS ----------
//   loadPlannerPayments(): void {
//     this.paymentsLoading = true;

//     this.plannerService.getPlannerPayments(this.plannerId).subscribe({
//       next: (pays: Payment[]) => {
//         this.plannerPayments = pays || [];
//         this.paymentByEventId = new Map<number, Payment>();
//         this.plannerPayments.forEach(p => this.paymentByEventId.set(p.eventId, p));
//         this.paymentsLoading = false;
//       },
//       error: () => {
//         this.paymentsLoading = false;
//       }
//     });
//   }

//   getPaymentForEvent(eventId: number): Payment | undefined {
//     return this.paymentByEventId.get(eventId);
//   }

//   isClientRequestedEvent(eventId: number): boolean {
//     return !!this.getPaymentForEvent(eventId);
//   }

//   getRevenueForEvent(eventId: number): number {
//     const pay = this.getPaymentForEvent(eventId);
//     if (!pay) return 0;
//     return pay.status === 'SUCCESS' ? (pay.amount || 0) : 0;
//   }

//   getPaymentLabel(eventId: number): string {
//     const pay = this.getPaymentForEvent(eventId);
//     if (!pay) return '—';
//     if (pay.status === 'SUCCESS') return `Paid ₹${pay.amount}`;
//     if (pay.status === 'FAILED') return 'Failed';
//     return 'Not Paid';
//   }

//   // ---------- STATUS / TIMELINE HELPERS ----------
//   private parseEventDate(d: any): Date | null {
//     if (!d) return null;
//     const dt = new Date(d);
//     return isNaN(dt.getTime()) ? null : dt;
//   }

//   getTimelineStatus(e: Event): 'UPCOMING' | 'ONGOING' | 'COMPLETED' {
//     if (e.status === 'COMPLETED') return 'COMPLETED';

//     const dt = this.parseEventDate(e.date);
//     if (!dt) return 'ONGOING';

//     const now = new Date();
//     return dt.getTime() > now.getTime() ? 'UPCOMING' : 'ONGOING';
//   }

//   getTimelineLabel(e: Event): string {
//     const t = this.getTimelineStatus(e);
//     if (t === 'UPCOMING') return 'Upcoming';
//     if (t === 'ONGOING') return 'Ongoing';
//     return 'Completed';
//   }

//   getTimelineClass(e: Event): string {
//     const t = this.getTimelineStatus(e);
//     if (t === 'UPCOMING') return 'chip-upcoming';
//     if (t === 'ONGOING') return 'chip-ongoing';
//     return 'chip-completed';
//   }

//   formatStatus(status: string): string {
//     if (status === 'INITIATED') return 'Initiated';
//     if (status === 'IN_PROGRESS') return 'In Progress';
//     if (status === 'COMPLETED') return 'Completed';
//     return status;
//   }

//   // ---------- TASKS ----------
//   loadTasks(): void {
//     this.plannerService.getAllTasks().subscribe(data => this.tasks = data);
//   }

//   loadStaffs(): void {
//     this.staffService.getAllStaff().subscribe(data => this.staffs = data);
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

//   submitTask(): void {
//     if (this.taskForm.invalid) return;

//     const eventId = Number(this.taskForm.get('eventId')?.value);
//     const staffId = Number(this.taskForm.get('staffId')?.value);
//     const description = (this.taskForm.get('description')?.value || '').trim();

//     if (!eventId || !staffId || !description) return;

//     const payload: Partial<Task> = { description, status: 'INITIATED' };

//     this.plannerService.createTaskForEvent(eventId, payload).subscribe(created => {
//       this.plannerService.assignTaskToStaff(created.id!, staffId).subscribe(() => {
//         this.taskForm.patchValue({ description: '' });
//         this.loadTasks();
//       });
//     });
//   }

//   createTemplateTasks(): void {
//     if (!this.canCreateTemplateTasks()) return;

//     const eventId = Number(this.taskForm.get('eventId')?.value);
//     const selected = Object.keys(this.selectedTemplateTasks).filter(t => this.selectedTemplateTasks[t]);

//     selected.forEach(taskName => {
//       const staffId = Number(this.templateTaskStaff[taskName]);
//       const payload: Partial<Task> = { description: taskName, status: 'INITIATED' };

//       this.plannerService.createTaskForEvent(eventId, payload).subscribe(created => {
//         this.plannerService.assignTaskToStaff(created.id!, staffId).subscribe(() => this.loadTasks());
//       });
//     });

//     selected.forEach(t => {
//       this.selectedTemplateTasks[t] = false;
//       this.templateTaskStaff[t] = '';
//     });
//   }

//   // ---------- REQUESTS ----------
//   loadRequests(): void {
//     this.requestsLoading = true;
//     this.plannerService.getRequests(this.plannerId).subscribe({
//       next: (data: EventRequest[]) => {
//         this.requests = data;
//         this.requestsLoading = false;

//         data.forEach(r => {
//           if (r.id && this.budgetInputs[r.id] == null && r.budgetProposed) {
//             this.budgetInputs[r.id] = r.budgetProposed;
//           }
//         });
//       },
//       error: () => this.requestsLoading = false
//     });
//   }

//   proposeBudget(requestId: number): void {
//     if (this.budgetLoading) return;

//     const budget = this.budgetInputs[requestId];
//     if (!budget || budget <= 0) return;

//     this.budgetLoading = true;

//     this.plannerService.proposeBudget(requestId, budget).subscribe({
//       next: () => {
//         this.budgetLoading = false;
//         this.loadRequests();
//       },
//       error: () => {
//         this.budgetLoading = false;
//       }
//     });
//   }

//   // ---------- PROFILE ----------
//   loadProfile(): void {
//     if (this.profileLoading) return;
//     this.profileLoading = true;

//     this.plannerService.getPlannerProfile(this.plannerId).subscribe({
//       next: (p: any) => {
//         this.plannerProfile = p;
//         this.profileLoading = false;
//       },
//       error: () => this.profileLoading = false
//     });
//   }

//   formatRequestStatus(status: string): string {
//     if (status === 'PENDING') return 'Pending';
//     if (status === 'BUDGET_PROPOSED') return 'Budget Proposed';
//     if (status === 'AGREED') return 'Agreed';
//     if (status === 'REJECTED') return 'Rejected';
//     return status;
//   }
// }

import { Component, OnInit, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { PlannerService } from '../../services/planner.service';
import { StaffService } from '../../services/staff.service';

import { Event } from '../../models/event.model';
import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';
import { EventRequest } from '../../models/event-request.model';
import { Payment } from '../../models/payment.model';

import { finalize } from 'rxjs/operators';

type PlannerTab = 'events' | 'tasks' | 'requests' | 'profile';
type EventsViewMode = 'cards' | 'table';

@Component({
  selector: 'app-planner-dashboard',
  templateUrl: './planner-dashboard.component.html',
  styleUrls: ['./planner-dashboard.component.css']
})
export class PlannerDashboardComponent implements OnInit {

  // ✅ Theme applied on component host (no HTML wrapper needed)
  @HostBinding('class') hostThemeClass = 'night';
  currentTheme: 'day' | 'night' = 'night';

  plannerId!: number;
  username!: string;

  activeTab: PlannerTab = 'events';

  // NEW: Table/Card view toggle
  eventsViewMode: EventsViewMode = 'cards';

  events: Event[] = [];
  tasks: Task[] = [];
  staffs: User[] = [];

  // Requests
  requests: EventRequest[] = [];
  requestsLoading = false;

  // Budget UI state (per request)
  budgetInputs: Record<number, number> = {};
  budgetLoading = false;

  // Profile
  plannerProfile: any | null = null;
  profileLoading = false;

  // Forms
  eventForm!: FormGroup;
  taskForm!: FormGroup;
  editingEventId: number | null = null;

  // Prevent double submit
  creatingEvent = false;

  // ✅ Payments (for Paid/Revenue)
  plannerPayments: Payment[] = [];
  paymentByEventId = new Map<number, Payment>();
  paymentsLoading = false;

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
    // ✅ Theme init (does not affect business logic)
    this.initTheme();

    const id = localStorage.getItem('user_id');
    if (!id) {
      this.router.navigate(['/login']);
      return;
    }

    this.plannerId = Number(id);
    this.username = localStorage.getItem('username') || 'User';

    this.initForms();
    this.loadEvents();
    this.loadPlannerPayments();
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

  setTab(tab: PlannerTab): void {
    this.activeTab = tab;

    if (tab === 'requests') this.loadRequests();
    if (tab === 'profile') this.loadProfile();
    if (tab === 'events') {
      this.loadEvents();
      this.loadPlannerPayments();
    }
  }

  toggleEventsView(mode: EventsViewMode): void {
    this.eventsViewMode = mode;
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
      staffId: ['', Validators.required],
      description: ['', Validators.required],
      status: [{ value: 'INITIATED', disabled: true }, Validators.required]
    });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/home']);
  }

  // ---------- EVENTS ----------
  loadEvents(): void {
    this.plannerService.getEventsByPlanner(this.plannerId).subscribe({
      next: (data) => {
        this.events = data;
        this.loadPlannerPayments();
      },
      error: () => {}
    });
  }

  submitEvent(): void {
    if (this.creatingEvent) return;

    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.creatingEvent = true;

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

    const request$ = this.editingEventId
      ? this.plannerService.updateEvent(this.editingEventId, payload)
      : this.plannerService.createEvent(this.plannerId, payload);

    request$
      .pipe(finalize(() => (this.creatingEvent = false)))
      .subscribe({
        next: () => {
          this.resetEventForm();
          this.loadEvents();
        },
        error: () => {}
      });
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

  // ---------- PAYMENTS ----------
  loadPlannerPayments(): void {
    this.paymentsLoading = true;

    this.plannerService.getPlannerPayments(this.plannerId).subscribe({
      next: (pays: Payment[]) => {
        this.plannerPayments = pays || [];
        this.paymentByEventId = new Map<number, Payment>();
        this.plannerPayments.forEach(p => this.paymentByEventId.set(p.eventId, p));
        this.paymentsLoading = false;
      },
      error: () => {
        this.paymentsLoading = false;
      }
    });
  }

  getPaymentForEvent(eventId: number): Payment | undefined {
    return this.paymentByEventId.get(eventId);
  }

  isClientRequestedEvent(eventId: number): boolean {
    return !!this.getPaymentForEvent(eventId);
  }

  getRevenueForEvent(eventId: number): number {
    const pay = this.getPaymentForEvent(eventId);
    if (!pay) return 0;
    return pay.status === 'SUCCESS' ? (pay.amount || 0) : 0;
  }

  getPaymentLabel(eventId: number): string {
    const pay = this.getPaymentForEvent(eventId);
    if (!pay) return '—';
    if (pay.status === 'SUCCESS') return `Paid ₹${pay.amount}`;
    if (pay.status === 'FAILED') return 'Failed';
    return 'Not Paid';
  }

  // ---------- STATUS / TIMELINE HELPERS ----------
  private parseEventDate(d: any): Date | null {
    if (!d) return null;
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
  }

getTimelineStatus(e: Event): 'UPCOMING' | 'ONGOING' | 'COMPLETED' {

  //  Highest priority
  if (e.status === 'COMPLETED') return 'COMPLETED';

  //  IN_PROGRESS should ALWAYS reflect Ongoing
  if (e.status === 'IN_PROGRESS') return 'ONGOING';

  //  INITIATED depends on date
  const dt = this.parseEventDate(e.date);
  if (!dt) return 'UPCOMING';

  const now = new Date();
  return dt.getTime() > now.getTime() ? 'UPCOMING' : 'ONGOING';
}

  getTimelineLabel(e: Event): string {
    const t = this.getTimelineStatus(e);
    if (t === 'UPCOMING') return 'Upcoming';
    if (t === 'ONGOING') return 'Ongoing';
    return 'Completed';
  }

  getTimelineClass(e: Event): string {
    const t = this.getTimelineStatus(e);
    if (t === 'UPCOMING') return 'chip-upcoming';
    if (t === 'ONGOING') return 'chip-ongoing';
    return 'chip-completed';
  }

  formatStatus(status: string): string {
    if (status === 'INITIATED') return 'Initiated';
    if (status === 'IN_PROGRESS') return 'In Progress';
    if (status === 'COMPLETED') return 'Completed';
    return status;
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

        data.forEach(r => {
          if (r.id && this.budgetInputs[r.id] == null && r.budgetProposed) {
            this.budgetInputs[r.id] = r.budgetProposed;
          }
        });
      },
      error: () => this.requestsLoading = false
    });
  }

  proposeBudget(requestId: number): void {
    if (this.budgetLoading) return;

    const budget = this.budgetInputs[requestId];
    if (!budget || budget <= 0) return;

    this.budgetLoading = true;

    this.plannerService.proposeBudget(requestId, budget).subscribe({
      next: () => {
        this.budgetLoading = false;
        this.loadRequests();
      },
      error: () => {
        this.budgetLoading = false;
      }
    });
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

  formatRequestStatus(status: string): string {
    if (status === 'PENDING') return 'Pending';
    if (status === 'BUDGET_PROPOSED') return 'Budget Proposed';
    if (status === 'AGREED') return 'Agreed';
    if (status === 'REJECTED') return 'Rejected';
    return status;
  }
}