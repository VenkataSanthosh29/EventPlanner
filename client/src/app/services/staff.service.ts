import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { Task } from '../models/task.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ✅ Get tasks assigned to a staff member
  getAssignedTasks(staffId: number): Observable<Task[]> {
    return this.http.get<Task[]>(
      `${this.baseUrl}/api/staff/tasks/${staffId}`
    );
  }

  // ✅ Update task status
  updateTaskStatus(taskId: number, status: string): Observable<Task> {
    const params = new HttpParams().set('status', status);

    return this.http.put<Task>(
      `${this.baseUrl}/api/staff/tasks/${taskId}`,
      null,
      { params }
    );
  }

  // ✅ Get all staff (used by planner dashboard)
  getAllStaff(): Observable<User[]> {
    return this.http.get<User[]>(
      `${this.baseUrl}/api/staff/all`
    );
  }
  getStaffProfile(staffId: number) {
  return this.http.get<any>(
    `${this.baseUrl}/api/staff/profile`,
    { params: { staffId } }
  );
}
}

