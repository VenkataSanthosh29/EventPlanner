import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { Event } from '../models/event.model';
import { Task } from '../models/task.model';
import { EventRequest } from '../models/event-request.model';
import { Payment } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PlannerService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ---------- EVENTS ----------

  createEvent(plannerId: number, event: Event): Observable<Event> {
    return this.http.post<Event>(
      `${this.baseUrl}/api/planner/event`,
      event,
      { params: { plannerId } }
    );
  }

  updateEvent(eventId: number, event: Event): Observable<Event> {
    return this.http.put<Event>(
      `${this.baseUrl}/api/planner/event/${eventId}`,
      event
    );
  }

  getEventsByPlanner(plannerId: number): Observable<Event[]> {
    return this.http.get<Event[]>(
      `${this.baseUrl}/api/planner/events`,
      { params: { plannerId } }
    );
  }

  // ---------- TASKS (Event-mapped) ----------

  createTaskForEvent(eventId: number, task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(
      `${this.baseUrl}/api/planner/events/${eventId}/task`,
      task
    );
  }

  assignTaskToStaff(taskId: number, staffId: number): Observable<Task> {
    return this.http.post<Task>(
      `${this.baseUrl}/api/planner/tasks/${taskId}/assign/${staffId}`,
      {}
    );
  }

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(
      `${this.baseUrl}/api/planner/tasks`
    );
  }

  getTasksByEvent(eventId: number): Observable<Task[]> {
    return this.http.get<Task[]>(
      `${this.baseUrl}/api/planner/events/${eventId}/tasks`
    );
  }

  updateTaskStatus(taskId: number, status: string): Observable<Task> {
    return this.http.put<Task>(
      `${this.baseUrl}/api/planner/tasks/${taskId}`,
      null,
      { params: { status } }
    );
  }

  // ---------- REQUESTS (NEW FLOW) ----------

  getRequests(plannerId: number): Observable<EventRequest[]> {
    return this.http.get<EventRequest[]>(
      `${this.baseUrl}/api/planner/requests`,
      { params: { plannerId } }
    );
  }

  // ✅ Planner proposes budget (client accepts/rejects)
  proposeBudget(requestId: number, budget: number): Observable<EventRequest> {
    return this.http.post<EventRequest>(
      `${this.baseUrl}/api/planner/requests/${requestId}/propose-budget`,
      {},
      { params: { budget } }
    );
  }

  // ❌ OLD FLOW REMOVED:
  // acceptRequest()
  // rejectRequest()

  // ---------- PROFILE + PAYMENTS ----------

  getPlannerProfile(plannerId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/api/planner/profile`,
      { params: { plannerId } }
    );
  }

  // ✅ Payments for all planner events (to show Paid/Not Paid)
  getPlannerPayments(plannerId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(
      `${this.baseUrl}/api/planner/payments`,
      { params: { plannerId } }
    );
  }
}