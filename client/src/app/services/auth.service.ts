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

  // ✅ Check if username exists
checkUsernameExists(username: string) {
  return this.http.get<boolean>(
    `${this.baseUrl}/api/user/exists/username`,
    { params: { username } }
  );
}

// ✅ Check if email exists
checkEmailExists(email: string) {
  return this.http.get<boolean>(
    `${this.baseUrl}/api/user/exists/email`,
    { params: { email } }
  );
}
sendOtp(email: string) {
  return this.http.post(
    `${this.baseUrl}/api/user/send-otp`,
    { email },
    { responseType: 'text' }
  );
}

verifyOtp(email: string, otp: string) {
  return this.http.post(
    `${this.baseUrl}/api/user/verify-otp`,
    { email, otp },
    { responseType: 'text' }
  );
}

forgotPasswordSendOtp(email: string) {
  return this.http.post(
    `${this.baseUrl}/api/user/forgot-password/send-otp`,
    { email },
    { responseType: 'text' }
  );
}

forgotPasswordVerifyOtp(email: string, otp: string) {
  return this.http.post(
    `${this.baseUrl}/api/user/forgot-password/verify-otp`,
    { email, otp },
    { responseType: 'text' }
  );
}

resetPassword(email: string, newPassword: string) {
  return this.http.post(
    `${this.baseUrl}/api/user/forgot-password/reset`,
    { email, newPassword },
    { responseType: 'text' }
  );
}
}

