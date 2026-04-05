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

  // =========================
  // 🔐 LOGIN
  // =========================
  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/api/user/login`,
      credentials
    ).pipe(
      tap(response => {

        // ✅ Save token
        localStorage.setItem('token', response.token);

        // ✅ Handle role safely (string / array)
        const role = Array.isArray(response.roles)
          ? response.roles[0]
          : response.roles;

        localStorage.setItem('role', role);

        // ✅ Save user id
        localStorage.setItem('user_id', String(response.userId));
      })
    );
  }

  // =========================
  // 👤 REGISTER
  // =========================
  createUser(userData: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/user/register`,
      userData
    );
  }

  // =========================
  // 📦 STORAGE HELPERS
  // =========================
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

  // =========================
  // ✅ VALIDATION APIs
  // =========================
  checkUsernameExists(username: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}/api/user/exists/username`,
      { params: { username } }
    );
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}/api/user/exists/email`,
      { params: { email } }
    );
  }

  // =========================
  // 🔐 OTP (REGISTER FLOW)
  // =========================
  sendOtp(email: string): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/api/user/send-otp`,
      { email },
      { responseType: 'text' }
    );
  }

  verifyOtp(email: string, otp: string): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/api/user/verify-otp`,
      { email, otp },
      { responseType: 'text' }
    );
  }

  // =========================
  // 🔁 FORGOT PASSWORD FLOW
  // =========================
  forgotPasswordSendOtp(email: string): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/api/user/forgot-password/send-otp`,
      { email },
      { responseType: 'text' }
    );
  }

  forgotPasswordVerifyOtp(email: string, otp: string): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/api/user/forgot-password/verify-otp`,
      { email, otp },
      { responseType: 'text' }
    );
  }

  resetPassword(email: string, newPassword: string): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/api/user/forgot-password/reset`,
      { email, newPassword },
      { responseType: 'text' }
    );
  }
}