import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}
 login(credentials: { username: string; password: string }): Observable<any> {
  return this.http.post<any>(
    `${this.baseUrl}/api/user/login`,
    credentials
  ).pipe(
    tap(response => {
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.roles); // ✅ CONSISTENT
      localStorage.setItem('user_id', String(response.userId));
    })
  );
}

  createUser(userData: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/user/register`,
      userData
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.clear();
  }
}

