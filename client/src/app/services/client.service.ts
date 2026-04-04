import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { Event } from '../models/event.model';
import { PlannerProfile } from '../models/planner-profile.model';
import { EventRequest } from '../models/event-request.model';

@Injectable({ providedIn: 'root' })
export class ClientService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.baseUrl}/api/client/events`);
  }

  getPlannerProfile(plannerId: number): Observable<PlannerProfile> {
    return this.http.get<PlannerProfile>(`${this.baseUrl}/api/client/planners/${plannerId}`);
  }

  getPlannerEvents(plannerId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.baseUrl}/api/client/planners/${plannerId}/events`);
  }

  createRequest(plannerId: number, payload: Partial<EventRequest>): Observable<EventRequest> {
    return this.http.post<EventRequest>(`${this.baseUrl}/api/client/planners/${plannerId}/requests`, payload);
  }

  getMyRequests(clientId: number): Observable<EventRequest[]> {
    return this.http.get<EventRequest[]>(`${this.baseUrl}/api/client/requests`, { params: { clientId } });
  }

  updateFeedbackAndRating(eventId: number, feedback: string, rating: number): Observable<Event> {
    return this.http.put<Event>(
      `${this.baseUrl}/api/client/event/${eventId}`,
      null,
      { params: { feedback, rating } }
    );
  }

  getClientProfile(clientId: number) {
  return this.http.get<any>(
    `${this.baseUrl}/api/client/profile`,
    { params: { clientId } }
  );
}
}