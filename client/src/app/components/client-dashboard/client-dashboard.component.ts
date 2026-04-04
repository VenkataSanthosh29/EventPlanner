import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ClientService } from '../../services/client.service';
import { Event } from '../../models/event.model';
import { EventRequest } from '../../models/event-request.model';

type ClientTab = 'all' | 'my' | 'requests' | 'profile';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {

  username!: string;
  clientId!: number;

  eligibleEventIds = new Set<number>();

  // ✅ unified tab state
  activeTab: ClientTab = 'all';

  // Data
  events: Event[] = [];
  myEvents: Event[] = [];
  myRequests: EventRequest[] = [];

  // Profile
  clientProfile: any | null = null;
  profileLoading = false;

  // Feedback/rating editor
  editingEventId: number | null = null;
  feedbackForm!: FormGroup;

  // Emoji rating options (1–5)
  ratingOptions = [
    { value: 1, emoji: '😡', label: 'Very Bad' },
    { value: 2, emoji: '🙁', label: 'Bad' },
    { value: 3, emoji: '😐', label: 'Okay' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '😄', label: 'Excellent' }
  ];

  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private clientService: ClientService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'User';
    this.clientId = Number(localStorage.getItem('user_id'));

    this.feedbackForm = this.fb.group({
      feedback: ['', Validators.required],
      rating: [null, Validators.required]
    });

    this.loadAllData();
  }

  // ✅ clean tab switch
  setTab(tab: ClientTab): void {
    this.activeTab = tab;
    this.cancelEdit(); // close editor when switching tabs

    if (tab === 'profile') {
      this.loadProfile();
    }
    if (tab === 'requests') {
      // requests already loaded in loadAllData; refresh if you want:
      this.loadRequests();
    }
    if (tab === 'my') {
      // ensure myEvents is up-to-date
      this.recomputeMyEvents();
    }
  }

  // ---------- Load ----------
  loadAllData(): void {
    this.clientService.getAllEvents().subscribe(events => {
      this.events = events;
      this.recomputeMyEvents();
    });

    this.loadRequests();
  }

  loadRequests(): void {
    this.clientService.getMyRequests(this.clientId).subscribe(reqs => {
      this.myRequests = reqs;
      this.recomputeMyEvents();
    });
  }

  // My Events = events created from ACCEPTED requests
 private recomputeMyEvents(): void {
  if (!this.events || this.events.length === 0) {
    this.myEvents = [];
    this.eligibleEventIds = new Set<number>();
    return;
  }

  const acceptedIds = new Set<number>(
    (this.myRequests || [])
      .filter(r => r.status === 'ACCEPTED' && !!r.createdEventId)
      .map(r => Number(r.createdEventId))
  );

  // ✅ store for button enable/disable
  this.eligibleEventIds = acceptedIds;

  // ✅ My Events tab list
  this.myEvents = this.events.filter(e => !!e.id && acceptedIds.has(Number(e.id)));
}

  // ---------- Profile ----------
  loadProfile(): void {
    if (this.profileLoading) return;
    this.profileLoading = true;

    this.clientService.getClientProfile(this.clientId).subscribe({
      next: (p: any) => {
        this.clientProfile = p;
        this.profileLoading = false;
      },
      error: () => {
        this.profileLoading = false;
      }
    });
  }

  // ---------- Rating helpers ----------
  setRating(value: number): void {
    this.feedbackForm.get('rating')?.setValue(value);
    this.feedbackForm.get('rating')?.markAsTouched();
  }

  getEmojiForRating(rating?: number): string {
    const found = this.ratingOptions.find(r => r.value === rating);
    return found ? found.emoji : '—';
  }

  // ---------- Feedback editor ----------
  editFeedback(event: Event): void {
  // ✅ Do not allow feedback if event not created by this client
  if (!this.canGiveFeedback(event)) return;

  this.editingEventId = event.id || null;

  this.successMessage = null;
  this.errorMessage = null;

  this.feedbackForm.patchValue({
    feedback: event.feedback || '',
    rating: event.rating ?? null
  });

  this.feedbackForm.markAsPristine();
  this.feedbackForm.markAsUntouched();
}

  submitFeedback(): void {
    if (!this.editingEventId) return;

    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      this.errorMessage = 'Please provide feedback and select a rating.';
      this.successMessage = null;
      return;
    }

    const feedback = (this.feedbackForm.value.feedback || '').trim();
    const rating = Number(this.feedbackForm.value.rating);

    this.clientService.updateFeedbackAndRating(this.editingEventId, feedback, rating).subscribe({
      next: () => {
        this.successMessage = 'Feedback & rating submitted successfully!';
        this.errorMessage = null;

        this.cancelEdit();
        this.loadAllData();
      },
      error: (err) => {
        this.successMessage = null;
        this.errorMessage = err?.error || 'Failed to submit feedback/rating';
      }
    });
  }

  cancelEdit(): void {
    this.editingEventId = null;
    this.feedbackForm.reset({ feedback: '', rating: null });
  }

  // ---------- Logout ----------
  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  canGiveFeedback(event: Event): boolean {
  return !!event.id && this.eligibleEventIds.has(Number(event.id));
}
}
