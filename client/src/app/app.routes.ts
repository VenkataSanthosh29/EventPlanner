import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

import { PlannerDashboardComponent } from './components/planner-dashboard/planner-dashboard.component';
import { StaffDashboardComponent } from './components/staff-dashboard/staff-dashboard.component';
import { ClientDashboardComponent } from './components/client-dashboard/client-dashboard.component';

import { PlannerProfileComponent } from './components/planner-profile/planner-profile.component';
import { ClientRequestsComponent } from './components/client-requests/client-requests.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { PaymentComponent } from './components/payment/payment.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'planner-dashboard', component: PlannerDashboardComponent },
  { path: 'staff-dashboard', component: StaffDashboardComponent },
  { path: 'client-dashboard', component: ClientDashboardComponent },
  { path: 'planner-profile/:plannerId', component: PlannerProfileComponent },
  { path: 'client-requests', component: ClientRequestsComponent },
  { path: 'payment/:paymentId', component: PaymentComponent },
  { path: '**', redirectTo: 'home' }
];
