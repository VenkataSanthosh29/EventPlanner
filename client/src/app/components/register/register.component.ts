import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registration',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  @ViewChild('authOrb') authOrbRef!: ElementRef<HTMLDivElement>;

  currentTheme: 'day' | 'night' = 'night';
  registrationForm: FormGroup;

  otpSent = false;
  otpVerified = false;
  otpValue = '';
  resendCooldown = 0;
  showPassword = false;

  /* ✅ POPUP STATE */
  showOtpPopup = false;
  otpPopupMessage = '';
  otpPopupSuccess = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['', Validators.required]
    });
  }

  /* =====================
     THEME
     ===================== */
  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'night' ? 'day' : 'night';
  }

  /* =====================
     PASSWORD
     ===================== */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /* =====================
     CURSOR ORB
     ===================== */
  onMouseMove(event: MouseEvent): void {
    const orb = this.authOrbRef?.nativeElement;
    if (!orb) return;

    orb.style.left = event.clientX + 'px';
    orb.style.top = event.clientY + 'px';
    orb.style.opacity = '1';
  }

  /* =====================
     SEND OTP
     ===================== */
  sendOtp(): void {
    const email = this.registrationForm.get('email')?.value;
    if (!email) return;

    this.auth.sendOtp(email).subscribe({
      next: () => {
        this.otpSent = true;
        this.startCooldown();
      },
      error: () => {
        this.showPopup(false, 'Failed to send OTP');
      }
    });
  }

  startCooldown(): void {
    this.resendCooldown = 30;
    const timer = setInterval(() => {
      if (--this.resendCooldown <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  }

  /* =====================
     OTP INPUT
     ===================== */
  getCleanOtp(): string {
    return this.otpValue.replace(/\D/g, '');
  }

  onOtpInput(): void {
    this.otpValue = this.getCleanOtp();
  }

  /* =====================
     VERIFY OTP ✅ NO REDIRECT HERE
     ===================== */
  verifyOtp(): void {
    const email = this.registrationForm.get('email')?.value;
    const otp = this.getCleanOtp();

    this.auth.verifyOtp(email, otp).subscribe({
      next: () => {
        this.otpVerified = true;
        this.showPopup(true, 'OTP verified successfully');
        // ✅ NO REDIRECT HERE
      },
      error: () => {
        this.showPopup(false, 'Invalid or expired OTP');
      }
    });
  }

  /* =====================
     REGISTER USER ✅ REDIRECT HERE
     ===================== */
  onSubmit(): void {
    if (!this.otpVerified) {
      this.showPopup(false, 'Please verify OTP first');
      return;
    }

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.auth.createUser(this.registrationForm.value).subscribe({
      next: () => {
        this.showPopup(true, 'Registration successful');

        /* ✅ Redirect AFTER registration only */
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: () => {
        this.showPopup(false, 'Registration failed');
      }
    });
  }

  /* =====================
     POPUP HANDLER
     ===================== */
  showPopup(success: boolean, message: string): void {
    this.otpPopupSuccess = success;
    this.otpPopupMessage = message;
    this.showOtpPopup = true;

    setTimeout(() => {
      this.showOtpPopup = false;
    }, 2000);
  }
}
