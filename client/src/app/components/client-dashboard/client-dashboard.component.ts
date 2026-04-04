// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';

// import { ClientService } from '../../services/client.service';
// import { Event } from '../../models/event.model';

// @Component({
//   selector: 'app-client-dashboard',
//   templateUrl: './client-dashboard.component.html',
//   styleUrls: ['./client-dashboard.component.css']
// })
// export class ClientDashboardComponent implements OnInit {

//   events: Event[] = [];
//   username!:string;

//   // Track feedback editing
//   editingEventId: number | null = null;

//   // Reactive form for feedback
//   feedbackForm!: FormGroup;

//   constructor(
//     private clientService: ClientService,
//     private fb: FormBuilder,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//  this.feedbackForm = this.fb.group({
//   feedback: ['', Validators.required],
//   rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]]
// });
//     this.username = localStorage.getItem('username') || 'User';
//     this.loadEvents();
//   }

//   // ✅ Load all events
//   loadEvents(): void {
//     this.clientService
//       .getAllEvents()
//       .subscribe(data => this.events = data);
//   }

//   // ✅ Enable feedback form for an event
//   editFeedback(event: Event): void {
//     this.editingEventId = event.id!;
//     this.feedbackForm.patchValue({
//       feedback: event.feedback || ''
//     });
//   }

//   // ✅ Submit feedback
//   submitFeedback(): void {
//     if (this.feedbackForm.invalid || !this.editingEventId) return;

//     const { feedback, rating } = this.feedbackForm.value;
//     this.clientService.updateFeedbackAndRating(this.editingEventId!, feedback, rating)
//       .subscribe(() => {
//         this.cancelEdit();
//         this.loadEvents();
//       });
//   }

//   // ✅ Cancel feedback edit
//   cancelEdit(): void {
//     this.editingEventId = null;
//     this.feedbackForm.reset();
//   }

//   logout(): void {
//     localStorage.clear();
//     this.router.navigate(['/login']);
//   }
// }


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

  username!: string;
  events: Event[] = [];

  // which event user is giving feedback/rating for
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

    this.feedbackForm = this.fb.group({
      feedback: ['', Validators.required],
      rating: [null, Validators.required] // ✅ required
    });

    this.loadEvents();
  }

  loadEvents(): void {
    this.clientService.getAllEvents().subscribe(data => {
      this.events = data;
    });
  }

  // Open editor for an event
  editFeedback(event: Event): void {
    this.editingEventId = event.id || null;

    this.successMessage = null;
    this.errorMessage = null;

    this.feedbackForm.patchValue({
      feedback: event.feedback || '',
      rating: event.rating ?? null
    });

    // mark untouched state
    this.feedbackForm.markAsPristine();
    this.feedbackForm.markAsUntouched();
  }

  // Emoji click -> set rating control
  setRating(value: number): void {
    this.feedbackForm.get('rating')?.setValue(value);
    this.feedbackForm.get('rating')?.markAsTouched();
  }

  // Display emoji in table
  getEmojiForRating(rating?: number): string {
    const found = this.ratingOptions.find(r => r.value === rating);
    return found ? found.emoji : '—';
  }

  submitFeedback(): void {
    if (!this.editingEventId) return;

    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      this.errorMessage = 'Please provide feedback and select a rating.';
      this.successMessage = null;
      return;
    }

    const feedback = this.feedbackForm.value.feedback.trim();
    const rating = Number(this.feedbackForm.value.rating);

    this.clientService.updateFeedbackAndRating(this.editingEventId, feedback, rating).subscribe({
      next: () => {
        this.successMessage = 'Feedback & rating submitted successfully!';
        this.errorMessage = null;

        this.cancelEdit();
        this.loadEvents();
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

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}

