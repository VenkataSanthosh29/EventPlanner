import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type Step = 'email' | 'otp' | 'reset';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  encapsulation:ViewEncapsulation.None
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  // Theme state to match Login Page
  currentTheme: 'night' | 'day' = 'night';

  // Step tracking
  step: Step = 'email';

  // Form handling
  form!: FormGroup;
  message: string | null = null;
  error: string | null = null;

  // Status flags
  emailExists = false;
  checkingEmail = false;

  // OTP Resend logic
  resendCooldown = 0;
  private resendTimer: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.pattern('^[0-9]{6}$')]],
      newPassword: ['', [Validators.minLength(8)]],
      confirmPassword: ['']
    });
  }

  /**
   * Theme Toggle (matches login page functionality)
   */
  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'night' ? 'day' : 'night';
  }

  /**
   * Step 1: Validate email existence
   */
  checkEmailExists(): void {
    const emailCtrl = this.form.get('email');
    if (!emailCtrl || emailCtrl.invalid) {
      this.emailExists = false;
      return;
    }

    this.checkingEmail = true;
    this.authService.checkEmailExists(emailCtrl.value).subscribe({
      next: (exists: boolean) => {
        this.emailExists = exists;
        this.checkingEmail = false;

        if (!exists) {
          emailCtrl.setErrors({ emailNotFound: true });
        } else {
          // If exists, clear specifically the emailNotFound error but keep others if any
          const errors = emailCtrl.errors;
          if (errors) {
            delete errors['emailNotFound'];
            emailCtrl.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
      },
      error: () => {
        this.emailExists = false;
        this.checkingEmail = false;
        this.error = "Could not verify email. Please try again.";
      }
    });
  }

  /**
   * Step 1 -> 2: Send OTP
   */
  sendOtp(): void {
    const email = this.form.get('email')?.value;
    if (!email) return;

    this.error = null;
    this.message = null;

    this.authService.forgotPasswordSendOtp(email).subscribe({
      next: () => {
        this.step = 'otp';
        this.message = 'Verification code sent to your email.';
        this.startResendCooldown();
      },
      error: (err) => {
        this.error = err?.error || 'Failed to send OTP. Please try again later.';
      }
    });
  }

  /**
   * Step 2 -> 3: Verify OTP
   */
  verifyOtp(): void {
    const email = this.form.get('email')?.value;
    const otp = (this.form.get('otp')?.value || '').trim();

    if (otp.length !== 6) {
      this.error = 'Please enter a valid 6-digit verification code.';
      return;
    }

    this.error = null;
    this.message = null;

    this.authService.forgotPasswordVerifyOtp(email, otp).subscribe({
      next: () => {
        this.step = 'reset';
        this.message = 'Identity verified. Please set your new password.';
        
        // Dynamically update validators for the reset step
        this.form.get('newPassword')?.setValidators([Validators.required, Validators.minLength(8)]);
        this.form.get('confirmPassword')?.setValidators([Validators.required]);
        this.form.get('newPassword')?.updateValueAndValidity();
        this.form.get('confirmPassword')?.updateValueAndValidity();
      },
      error: (err) => {
        this.error = err?.error || 'Invalid or expired OTP code.';
      }
    });
  }

  /**
   * Step 3: Finalize Reset
   */
  resetPassword(): void {
    const email = this.form.get('email')?.value;
    const newPassword = this.form.get('newPassword')?.value;
    const confirm = this.form.get('confirmPassword')?.value;

    if (newPassword !== confirm) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.error = null;
    this.message = null;

    this.authService.resetPassword(email, newPassword).subscribe({
      next: () => {
        this.message = 'Password updated successfully! Redirecting you to login...';
        // Short delay to let the user see the success message
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.error = err?.error || 'Failed to update password. Please try again.';
      }
    });
  }

  startResendCooldown(): void {
    this.resendCooldown = 30;
    if (this.resendTimer) clearInterval(this.resendTimer);

    this.resendTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.resendTimer);
      }
    }, 1000);
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}