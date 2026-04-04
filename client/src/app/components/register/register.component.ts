import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  AsyncValidatorFn
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map,
  of
} from 'rxjs';

@Component({
  selector: 'app-registration',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registrationForm!: FormGroup;

  successMessage: string | null = null;
  errorMessage: string | null = null;

  //  OTP state
  otpSent = false;
  otpVerified = false;
  otpValue = '';

  resendCooldown = 0;
  private resendTimer: any;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.registrationForm = this.formBuilder.group({
      username: ['', {
        validators: [Validators.required],
        asyncValidators: [this.usernameExistsValidator()],
        updateOn: 'blur'
      }],
      email: ['', {
        validators: [Validators.required, Validators.email],
        asyncValidators: [this.emailExistsValidator()],
        updateOn: 'blur'
      }],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['', Validators.required]
    });
  }


  // OTP FLOW


sendOtp(): void {
  const emailControl = this.registrationForm.get('email');

  if (!emailControl) return;

  //  If invalid email format
  if (emailControl.invalid) {
    emailControl.markAsTouched();
    this.errorMessage = 'Please enter a valid email first';
    return;
  }

  //  If email already exists in DB (async validator)
  if (emailControl.hasError('emailTaken')) {
    emailControl.markAsTouched();
    this.errorMessage = 'Email already exists';
    return;
  }

  this.errorMessage = null;

  this.authService.sendOtp(emailControl.value).subscribe({
    next: () => {
      this.otpSent = true;
      this.successMessage = 'OTP sent to your email';
      this.startResendCooldown();
    },
    error: err => {
      this.errorMessage = err?.error || 'Failed to send OTP';
    }
  });
}
  /**  Remove spaces & non-digits */
  getCleanOtp(): string {
    return this.otpValue.replace(/\D/g, '');
  }

  verifyOtp(): void {
    const email = this.registrationForm.get('email')?.value;
    const otp = this.getCleanOtp();

    this.authService.verifyOtp(email, otp).subscribe({
      next: () => {
        this.otpVerified = true;
        this.errorMessage = null;
        this.successMessage = 'Email verified successfully';
      },
      error: err => {
        this.errorMessage = err?.error || 'Invalid or expired OTP';
      }
    });
  }

  startResendCooldown(): void {
    this.resendCooldown = 30;
    clearInterval(this.resendTimer);

    this.resendTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.resendTimer);
      }
    }, 1000);
  }
  // REGISTRATION
  onSubmit(): void {

    if (!this.otpVerified) {
      this.errorMessage = 'Please verify your email before registering.';
      return;
    }

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const payload = this.registrationForm.value;

    this.authService.createUser(payload).subscribe({
      next: () => {
        this.successMessage = 'Registration successful!';
        this.errorMessage = null;

        this.registrationForm.reset();
        this.otpSent = false;
        this.otpVerified = false;
        this.otpValue = '';
        this.resendCooldown = 0;
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage =
          err?.error?.message ||
          err?.message ||
          'Registration failed';
      }
    });
  }
  // ASYNC VALIDATORS
  usernameExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);

      return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(username =>
          this.authService.checkUsernameExists(username)
        ),
        map(exists => (exists ? { usernameTaken: true } : null))
      );
    };
  }

  emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value || control.invalid) return of(null);

      return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(email =>
          this.authService.checkEmailExists(email)
        ),
        map(exists => (exists ? { emailTaken: true } : null))
      );
    };
  }
  onOtpInput(): void {
  this.otpValue = this.otpValue.replace(/\D/g, '');
}
}
