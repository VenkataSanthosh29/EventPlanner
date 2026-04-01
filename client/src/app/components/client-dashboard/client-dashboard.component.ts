import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ClientService } from '../../services/client.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {

  events: Event[] = [];
  username!:string;

  // Track feedback editing
  editingEventId: number | null = null;

  // Reactive form for feedback
  feedbackForm!: FormGroup;

  constructor(
    private clientService: ClientService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.feedbackForm = this.fb.group({
      feedback: ['', Validators.required]
    });
    this.username = localStorage.getItem('username') || 'User';
    this.loadEvents();
  }

  // ✅ Load all events
  loadEvents(): void {
    this.clientService
      .getAllEvents()
      .subscribe(data => this.events = data);
  }

  // ✅ Enable feedback form for an event
  editFeedback(event: Event): void {
    this.editingEventId = event.id!;
    this.feedbackForm.patchValue({
      feedback: event.feedback || ''
    });
  }

  // ✅ Submit feedback
  submitFeedback(): void {
    if (this.feedbackForm.invalid || !this.editingEventId) return;

    const { feedback } = this.feedbackForm.value;

    this.clientService
      .updateFeedback(this.editingEventId, feedback)
      .subscribe(() => {
        this.cancelEdit();
        this.loadEvents();
      });
  }

  // ✅ Cancel feedback edit
  cancelEdit(): void {
    this.editingEventId = null;
    this.feedbackForm.reset();
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}

