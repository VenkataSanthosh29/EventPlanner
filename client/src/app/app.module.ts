import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PlannerDashboardComponent } from './components/planner-dashboard/planner-dashboard.component';
import { StaffDashboardComponent } from './components/staff-dashboard/staff-dashboard.component';
import { ClientDashboardComponent } from './components/client-dashboard/client-dashboard.component';
import { PlannerProfileComponent } from './components/planner-profile/planner-profile.component';
import { ClientRequestsComponent } from './components/client-requests/client-requests.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { HomeComponent } from './components/home/home.component'; // ✅ ADD THIS BACK

import { routes } from './app.routes';
import { AuthInterceptor } from './services/auth.interceptor';
import { PaymentComponent } from './components/payment/payment.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    PlannerDashboardComponent,
    StaffDashboardComponent,
    ClientDashboardComponent,
    PlannerProfileComponent,
    ClientRequestsComponent,
    ForgotPasswordComponent,
    PaymentComponent,
    HomeComponent // ✅ IMPORTANT
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}