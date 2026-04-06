import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { Event } from '../models/event.model';
import { PlannerProfile } from '../models/planner-profile.model';
import { Payment } from '../models/payment.model';
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
//  Client accepts budget
acceptBudget(requestId: number, clientId: number) {
  return this.http.post<EventRequest>(
    `${this.baseUrl}/api/client/requests/${requestId}/accept-budget`,
    {},
    { params: { clientId } }
  );
}

// Client rejects budget
rejectBudget(requestId: number, clientId: number) {
  return this.http.post<EventRequest>(
    `${this.baseUrl}/api/client/requests/${requestId}/reject-budget`,
    {},
    { params: { clientId } }
  );
}

// Payments list (to show Pay Now status)
getMyPayments(clientId: number) {
  return this.http.get<Payment[]>(
    `${this.baseUrl}/api/client/payments`,
    { params: { clientId } }
  );
}

// Create Razorpay QR (Pay Now)
createRazorpayQr(paymentId: number, clientId: number) {
  return this.http.post<Payment>(
    `${this.baseUrl}/api/client/payments/${paymentId}/razorpay/qr`,
    {},
    { params: { clientId } }
  );
}

// Poll payment status (backup)
getPayment(paymentId: number, clientId: number) {
  return this.http.get<Payment>(
    `${this.baseUrl}/api/client/payments/${paymentId}`,
    { params: { clientId } }
  );
}
markPaymentSuccessDemo(paymentId: number, clientId: number) {
  return this.http.post(
    `${this.baseUrl}/api/client/payments/${paymentId}/demo-success`,
    {},
    { params: { clientId }, responseType: 'text' }
  );
}
}