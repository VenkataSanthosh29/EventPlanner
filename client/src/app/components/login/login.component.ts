import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  errorMessage: string | null = null;

  // UI States
  passwordVisible = false;
  isPasswordRevealing = false;
  currentTheme: 'night' | 'day' = 'night';

  constructor(
    private fb: FormBuilder,
    private el: ElementRef,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
  username: ['', [
    Validators.required,
    Validators.pattern(/^[a-zA-Z0-9_]+$/) // ✅ allow underscore
  ]],
  password: ['', [
    Validators.required,
    Validators.minLength(8)
  ]]
  });
  }


  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const orb = this.el.nativeElement.querySelector('.ep-login-orb') as HTMLElement;
    if (orb) {
      orb.style.left = `${e.clientX}px`;
      orb.style.top = `${e.clientY}px`;
      orb.style.opacity = '0.6';
    }
  }

  @HostListener('document:mouseleave')
  onMouseLeave() {
    const orb = this.el.nativeElement.querySelector('.ep-login-orb') as HTMLElement;
    if (orb) {
      orb.style.opacity = '0';
    }
  }


  onRevealClick(): void {
    this.isPasswordRevealing = true;

    // Toggle password visibility mid animation
    setTimeout(() => {
      this.passwordVisible = !this.passwordVisible;
    }, 200);

    // Reset animation
    setTimeout(() => {
      this.isPasswordRevealing = false;
    }, 800);
  }

  stopPasswordRevealAnimation(): void {
    this.isPasswordRevealing = false;
  }


  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'night' ? 'day' : 'night';
  }


  onSubmit(): void {
 if (this.loginForm.invalid) {
  this.loginForm.markAllAsTouched();
  this.errorMessage = 'Please fill out the form correctly.';
  return;
}
    this.errorMessage = null;

    this.authService.login(this.loginForm.value).pipe(

      tap((response: any) => {
        if (!response) return;

        //  Store username
        localStorage.setItem('username', this.loginForm.value.username);

        //  Handle multiple role formats safely
        const roleRaw =
          response?.roles ??
          response?.role ??
          response?.user?.roles ??
          response?.user?.role ??
          null;

        const role = Array.isArray(roleRaw) ? roleRaw[0] : roleRaw;

        //  Navigate based on role
        if (role === 'PLANNER') {
          this.router.navigate(['/planner-dashboard']);
        } 
        else if (role === 'STAFF') {
          this.router.navigate(['/staff-dashboard']);
        } 
        else if (role === 'CLIENT') {
          this.router.navigate(['/client-dashboard']);
        } 
        else {
          this.router.navigate(['/home']); // fallback
        }
      }),

      catchError(error => {
        console.error('Login error:', error);
        this.errorMessage = 'Invalid username or password';
        return of(null);
      })

    ).subscribe();
  }
}