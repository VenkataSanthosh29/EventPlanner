import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
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

import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-registration',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent implements OnInit, OnDestroy {

  //Template Refs 
  @ViewChild('authOrb')  authOrbRef!: ElementRef<HTMLDivElement>;
  @ViewChild('otpInput') otpInputRef!: ElementRef<HTMLInputElement>;

  //Theme 
  currentTheme: 'night' | 'day' = 'night';

  // Form 
  registrationForm!: FormGroup;

  //Feedback (main form)
  successMessage: string | null = null;
  errorMessage:   string | null = null;

  //OTP State
  otpSent     = false;
  otpVerified = false;
  otpValue    = '';
  isVerifying = false;

  /** Shows/hides the overlay mini card */
  showOtpBox = false;

  /** Error shown inside the OTP overlay */
  otpError: string | null = null;

  /** Green flash shown in the main form for 3 s after verify */
  otpSuccessFlash: string | null = null;

  // Cooldown 
  resendCooldown = 0;
  private resendTimer:   any;
  private otpFlashTimer: any;

  //assword Visibility
  showPassword = false;

 constructor(
  private formBuilder: FormBuilder,
  private authService: AuthService,
  private route: ActivatedRoute
) {}

  //Lifecycle 
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
      role:     ['', Validators.required]
    });
    // Auto-select role if passed from Home page (but user can change it)
  this.route.queryParamMap.subscribe(params => {
  const role = params.get('role');

  const allowed = ['CLIENT', 'PLANNER', 'STAFF'];

  if (role && allowed.includes(role)) {
    this.registrationForm.patchValue({ role }); // user can still change later
    this.registrationForm.get('role')?.markAsTouched();
  }
});
}

  ngOnDestroy(): void {
    if (this.resendTimer)   clearInterval(this.resendTimer);
    if (this.otpFlashTimer) clearTimeout(this.otpFlashTimer);
  }

  //Theme
  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'night' ? 'day' : 'night';
  }

  // Password 

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  //Cursor Orb 

  onMouseMove(event: MouseEvent): void {
    const orb = this.authOrbRef?.nativeElement;
    if (!orb) return;
    orb.style.opacity = '1';
    orb.style.left    = event.clientX + 'px';
    orb.style.top     = event.clientY + 'px';
  }

  //Overlay click (close on backdrop)

  onOverlayClick(event: MouseEvent): void {
    // close only if clicking the dark backdrop, not the card itself
    if ((event.target as HTMLElement).classList.contains('otp-overlay')) {
      this.closeOtpBox();
    }
  }

  closeOtpBox(): void {
    this.showOtpBox = false;
    this.otpError   = null;
  }

  // OTP: Send 

  sendOtp(): void {
    const emailControl = this.registrationForm.get('email');
    if (!emailControl) return;

    if (emailControl.invalid) {
      emailControl.markAsTouched();
      this.errorMessage = 'Please enter a valid email first.';
      return;
    }

    if (emailControl.hasError('emailTaken')) {
      emailControl.markAsTouched();
      this.errorMessage = 'Email already exists.';
      return;
    }

    this.errorMessage = null;
    this.otpError     = null;

    this.authService.sendOtp(emailControl.value).subscribe({
      next: () => {
        this.otpSent    = true;
        this.showOtpBox = true;           // open the overlay
        this.otpValue   = '';
        this.startResendCooldown();

        // auto-focus OTP input after overlay renders
        setTimeout(() => this.otpInputRef?.nativeElement?.focus(), 120);
      },
      error: err => {
        this.errorMessage = err?.error || 'Failed to send OTP.';
      }
    });
  }

  // OTP: Input sanitise

  getCleanOtp(): string {
    return this.otpValue.replace(/\D/g, '');
  }

  onOtpInput(): void {
    this.otpValue = this.otpValue.replace(/\D/g, '');
  }

  //OTP: Verify 

  verifyOtp(): void {
    const email = this.registrationForm.get('email')?.value;
    const otp   = this.getCleanOtp();

    this.otpError     = null;
    this.isVerifying  = true;

    this.authService.verifyOtp(email, otp).subscribe({
      next: () => {
        this.isVerifying  = false;
        this.otpVerified  = true;

        // 1. Close overlay
        this.showOtpBox = false;
        this.otpError   = null;

        // 2. Flash success in main form
        this.otpSuccessFlash = 'Email verified successfully!';

        // 3. Auto-clear flash after 3 seconds
        if (this.otpFlashTimer) clearTimeout(this.otpFlashTimer);
        this.otpFlashTimer = setTimeout(() => {
          this.otpSuccessFlash = null;
        }, 3000);
      },
      error: err => {
        this.isVerifying = false;
        this.otpError    = err?.error || 'Invalid or expired OTP.';
      }
    });
  }

  //Resend Cooldown 
  startResendCooldown(): void {
    this.resendCooldown = 30;
    clearInterval(this.resendTimer);
    this.resendTimer = setInterval(() => {
      if (--this.resendCooldown <= 0) clearInterval(this.resendTimer);
    }, 1000);
  }

  // Registration Submit 

  onSubmit(): void {
    if (!this.otpVerified) {
      this.errorMessage = 'Please verify your email before registering.';
      return;
    }

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.authService.createUser(this.registrationForm.value).subscribe({
      next: () => {
        this.successMessage  = 'Registration successful!';
        this.errorMessage    = null;
        this.otpSuccessFlash = null;
        this.registrationForm.reset();
        this.otpSent        = false;
        this.otpVerified    = false;
        this.showOtpBox     = false;
        this.otpValue       = '';
        this.resendCooldown = 0;
        this.showPassword   = false;
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage =
          err?.error?.message || err?.message || 'Registration failed.';
      }
    });
  }

  //  Async Validators
  usernameExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);
      return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(username => this.authService.checkUsernameExists(username)),
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
        switchMap(email => this.authService.checkEmailExists(email)),
        map(exists => (exists ? { emailTaken: true } : null))
      );
    };
  }
}