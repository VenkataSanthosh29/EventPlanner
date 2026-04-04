// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../environments/environment';

// import { Event } from '../models/event.model';

// @Injectable({
//   providedIn: 'root'
// })
// export class ClientService {

//   private baseUrl = environment.apiUrl;

//   constructor(private http: HttpClient) {}

//   // ✅ Get all events
//   getAllEvents(): Observable<Event[]> {
//     return this.http.get<Event[]>(
//       `${this.baseUrl}/api/client/events`
//     );
//   }

//   // ✅ Update feedback
//   // updateFeedback(eventId: number, feedback: string): Observable<Event> {
//   //   return this.http.put<Event>(
//   //     `${this.baseUrl}/api/client/event/${eventId}`,
//   //     null,
//   //     { params: { feedback } }
//   //   );
//   // }

//   updateFeedbackAndRating(eventId: number, feedback: string, rating: number) {
//   return this.http.put(
//     `${this.baseUrl}/api/client/event/${eventId}`,
//     null,
//     { params: { feedback, rating } }
//   );
// }
// }


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(
      `${this.baseUrl}/api/client/events`
    );
  }

  // ✅ Sends both feedback + rating
  updateFeedbackAndRating(eventId: number, feedback: string, rating: number): Observable<Event> {
    return this.http.put<Event>(
      `${this.baseUrl}/api/client/event/${eventId}`,
      null,
      { params: { feedback, rating } }
    );
  }
}