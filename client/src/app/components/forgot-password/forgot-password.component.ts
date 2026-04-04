import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type Step = 'email' | 'otp' | 'reset';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  step: Step = 'email';

  form!: FormGroup;

  message: string | null = null;
  error: string | null = null;

  emailExists = false;
  checkingEmail = false;

  resendCooldown = 0;
  private resendTimer: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: [''],
      newPassword: [''],
      confirmPassword: ['']
    });
  }

  // ✅ validate email existence and control Send OTP enablement
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
          // clear only emailNotFound
          if (emailCtrl.hasError('emailNotFound')) {
            emailCtrl.setErrors(null);
          }
        }
      },
      error: () => {
        this.emailExists = false;
        this.checkingEmail = false;
      }
    });
  }

  sendOtp(): void {
    const email = this.form.get('email')?.value;
    this.error = null;
    this.message = null;

    this.authService.forgotPasswordSendOtp(email).subscribe({
      next: () => {
        this.step = 'otp';
        this.message = 'OTP sent to your email.';
        this.startResendCooldown();
      },
      error: err => {
        this.error = err?.error || 'Failed to send OTP';
      }
    });
  }

  verifyOtp(): void {
    const email = this.form.get('email')?.value;
    const otp = (this.form.get('otp')?.value || '').trim();

    if (otp.length !== 6) {
      this.error = 'Enter a valid 6-digit OTP';
      return;
    }

    this.error = null;
    this.message = null;

    this.authService.forgotPasswordVerifyOtp(email, otp).subscribe({
      next: () => {
        this.step = 'reset';
        this.message = 'OTP verified. Set a new password.';

        this.form.get('newPassword')?.setValidators([Validators.required, Validators.minLength(8)]);
        this.form.get('confirmPassword')?.setValidators([Validators.required, Validators.minLength(8)]);
        this.form.get('newPassword')?.updateValueAndValidity();
        this.form.get('confirmPassword')?.updateValueAndValidity();
      },
      error: err => {
        this.error = err?.error || 'Invalid or expired OTP';
      }
    });
  }

  resetPassword(): void {
    const email = this.form.get('email')?.value;
    const newPassword = this.form.get('newPassword')?.value;
    const confirm = this.form.get('confirmPassword')?.value;

    if (newPassword !== confirm) {
      this.error = 'Passwords do not match';
      return;
    }

    this.error = null;
    this.message = null;

    this.authService.resetPassword(email, newPassword).subscribe({
      next: () => {
        this.message = 'Password updated successfully. Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 900);
      },
      error: err => {
        this.error = err?.error || 'Failed to reset password';
      }
    });
  }

  startResendCooldown(): void {
    this.resendCooldown = 30;
    clearInterval(this.resendTimer);

    this.resendTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) clearInterval(this.resendTimer);
    }, 1000);
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}