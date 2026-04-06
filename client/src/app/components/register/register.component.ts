import { Component, ViewChild, ElementRef, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  AsyncValidatorFn
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { debounceTime, distinctUntilChanged, switchMap, map, of } from 'rxjs';

@Component({
  selector: 'app-registration',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {

  @ViewChild('authOrb') authOrbRef!: ElementRef<HTMLDivElement>;

  currentTheme: 'day' | 'night' = 'night';
  registrationForm: FormGroup;

  showPassword = false;

  /* OTP POPUP STATE */
  showOtpBox = false;
  otpValue = '';
  otpVerified = false;
  otpError: string | null = null;

  resendCooldown = 0;
  private resendTimer: any;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute // ✅ NEW
  ) {
    this.registrationForm = this.fb.group({
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

  ngOnInit(): void {
    // ✅ NEW: Prefill role from home page buttons: /register?role=PLANNER/CLIENT/STAFF
    this.applyRoleFromQuery();
  }

  ngOnDestroy(): void {
    if (this.resendTimer) clearInterval(this.resendTimer);
  }

  // ✅ NEW: read role query param and set it (without locking)
  private applyRoleFromQuery(): void {
    this.route.queryParamMap.subscribe(params => {
      const role = (params.get('role') || '').toUpperCase();
      const allowed = ['CLIENT', 'PLANNER', 'STAFF'];

      if (!allowed.includes(role)) return;

      const roleCtrl = this.registrationForm.get('role');
      if (!roleCtrl) return;

      // ✅ Don't override if user already selected something manually
      // (so they can still change the role later)
      const current = (roleCtrl.value || '').toString().toUpperCase();

      // If empty OR untouched/pristine, set from query param
      if (!current || roleCtrl.pristine) {
        roleCtrl.setValue(role);
        // do NOT disable; user can change it
      }
    });
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'night' ? 'day' : 'night';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onMouseMove(event: MouseEvent): void {
    const orb = this.authOrbRef?.nativeElement;
    if (!orb) return;

    orb.style.left = event.clientX + 'px';
    orb.style.top = event.clientY + 'px';
    orb.style.opacity = '1';
  }

  /* =====================
     SEND OTP → OPEN POPUP
     ===================== */
  sendOtp(): void {
    const emailCtrl = this.registrationForm.get('email');
    if (!emailCtrl) return;

    if (emailCtrl.invalid) {
      emailCtrl.markAsTouched();
      return;
    }

    if (emailCtrl.hasError('emailTaken')) {
      emailCtrl.markAsTouched();
      return;
    }

    this.otpError = null;

    this.auth.sendOtp(emailCtrl.value).subscribe({
      next: () => {
        this.showOtpBox = true;
        this.otpVerified = false;
        this.otpValue = '';
        this.startCooldown();
      },
      error: () => {
        this.otpError = 'Failed to send OTP';
        this.showOtpBox = true;
      }
    });
  }

  startCooldown(): void {
    this.resendCooldown = 30;
    clearInterval(this.resendTimer);
    this.resendTimer = setInterval(() => {
      if (--this.resendCooldown <= 0) clearInterval(this.resendTimer);
    }, 1000);
  }

  getCleanOtp(): string {
    return this.otpValue.replace(/\D/g, '');
  }

  onOtpInput(): void {
    this.otpValue = this.getCleanOtp();
  }

  verifyOtp(): void {
    const email = this.registrationForm.get('email')?.value;
    const otp = this.getCleanOtp();

    this.otpError = null;

    this.auth.verifyOtp(email, otp).subscribe({
      next: () => {
        this.otpVerified = true;
        this.otpError = null;
        // ❌ No redirect here
      },
      error: () => {
        this.otpVerified = false;
        this.otpError = 'Invalid or expired OTP';
      }
    });
  }

  closeOtpPopup(): void {
    this.showOtpBox = false;
    this.otpValue = '';
    this.otpError = null;
  }

  onSubmit(): void {
    if (!this.otpVerified) return;

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.auth.createUser(this.registrationForm.value).subscribe({
      next: () => {
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: () => {
        this.otpError = 'Registration failed';
      }
    });
  }

  /* =====================
     ASYNC VALIDATORS
     ===================== */
  usernameExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);

      return of(control.value).pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(username => this.auth.checkUsernameExists(username)),
        map(exists => (exists ? { usernameTaken: true } : null))
      );
    };
  }

  emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value || control.invalid) return of(null);

      return of(control.value).pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(email => this.auth.checkEmailExists(email)),
        map(exists => (exists ? { emailTaken: true } : null))
      );
    };
  }
}