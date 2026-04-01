import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, switchMap, map, of } from 'rxjs';
import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';


@Component({
  selector: 'app-registration',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registrationForm!: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  // ngOnInit(): void {
  //   this.registrationForm = this.formBuilder.group({
  //     username: ['', Validators.required],
  //     email: ['', [Validators.required, Validators.email]],
  //     password: ['', [Validators.required, Validators.minLength(8)]],
  //     role: ['', Validators.required]
  //   });
  // }

  ngOnInit(): void {
  this.registrationForm = this.formBuilder.group({
    username: ['', {
      validators: [Validators.required],
      asyncValidators: [this.usernameExistsValidator()],
      updateOn: 'blur'   // ✅ better UX, no API spam
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

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      this.errorMessage = 'Please fill out the form correctly.';
      return;
    }

    this.successMessage = null;
    this.errorMessage = null;

    const payload = this.registrationForm.value;

    this.authService.createUser(payload).subscribe({

      next: response => {
        this.successMessage = 'Registration successful!';
        this.registrationForm.reset();
      },

      error: (err: HttpErrorResponse) => {
        this.errorMessage =
          err?.error?.message ||
          err?.message ||
          'Something went wrong. Please try again.';
        console.error('Registration error:', err);
      }

    });
  }
// ✅ Async username validator
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

// ✅ Async email validator
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
}

