import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { Event } from '../models/event.model';
import { Task } from '../models/task.model';

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

  // ---------- TASKS ----------

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(
      `${this.baseUrl}/api/planner/task`,
      task
    );
  }

  assignTaskToStaff(taskId: number, staffId: number): Observable<Task> {
    return this.http.post<Task>(
      `${this.baseUrl}/api/planner/tasks/${taskId}/assign/${staffId}`,
      {}
    );
  }

  updateTaskStatus(taskId: number, status: string): Observable<Task> {
    return this.http.put<Task>(
      `${this.baseUrl}/api/planner/tasks/${taskId}`,
      null,
      { params: { status } }
    );
  }

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(
      `${this.baseUrl}/api/planner/tasks`
    );
  }
}