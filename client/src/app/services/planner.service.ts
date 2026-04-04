import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { Event } from '../models/event.model';
import { Task } from '../models/task.model';


import { EventRequest } from '../models/event-request.model';


@Injectable({
  providedIn: 'root'
})
export class PlannerService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ---------- EVENTS ----------

  createEvent(plannerId: number, event: Event): Observable<Event> {
    return this.http.post<Event>(
      `${this.baseUrl}/api/planner/event?plannerId=${plannerId}`,
      event
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
      `${this.baseUrl}/api/planner/events?plannerId=${plannerId}`
    );
  }

  // ---------- TASKS (Event-mapped) ----------

  // ✅ NEW: create task under a specific event
  createTaskForEvent(eventId: number, task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(
      `${this.baseUrl}/api/planner/events/${eventId}/task`,
      task
    );
  }

  // ✅ assign staff after task creation
  assignTaskToStaff(taskId: number, staffId: number): Observable<Task> {
    return this.http.post<Task>(
      `${this.baseUrl}/api/planner/tasks/${taskId}/assign/${staffId}`,
      {}
    );
  }

  // ✅ get all tasks (if you still want global list)
  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(
      `${this.baseUrl}/api/planner/tasks`
    );
  }

  // ✅ OPTIONAL: get tasks for a particular event (recommended after mapping)
  getTasksByEvent(eventId: number): Observable<Task[]> {
    return this.http.get<Task[]>(
      `${this.baseUrl}/api/planner/events/${eventId}/tasks`
    );
  }

  // ---------- OPTIONAL (only if planner can update task status; else unused) ----------

  updateTaskStatus(taskId: number, status: string): Observable<Task> {
    return this.http.put<Task>(
      `${this.baseUrl}/api/planner/tasks/${taskId}`,
      null,
      { params: { status } }
    );
  }

getRequests(plannerId: number) {
  return this.http.get<EventRequest[]>(
    `${this.baseUrl}/api/planner/requests`,
    { params: { plannerId } }
  );
}

acceptRequest(requestId: number) {
  return this.http.post<EventRequest>(
    `${this.baseUrl}/api/planner/requests/${requestId}/accept`,
    {}
  );
}

rejectRequest(requestId: number) {
  return this.http.post<EventRequest>(
    `${this.baseUrl}/api/planner/requests/${requestId}/reject`,
    {}
  );
}

getPlannerProfile(plannerId: number) {
  return this.http.get<any>(
    `${this.baseUrl}/api/planner/profile`,
    { params: { plannerId } }
  );
}
}