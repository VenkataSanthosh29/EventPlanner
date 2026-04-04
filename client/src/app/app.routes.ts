import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PlannerDashboardComponent } from './components/planner-dashboard/planner-dashboard.component';
import { StaffDashboardComponent } from './components/staff-dashboard/staff-dashboard.component';
import { ClientDashboardComponent } from './components/client-dashboard/client-dashboard.component';


import { PlannerProfileComponent } from './components/planner-profile/planner-profile.component';
import { ClientRequestsComponent } from './components/client-requests/client-requests.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';

 
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'planner-dashboard', component: PlannerDashboardComponent },
  { path: 'staff-dashboard', component: StaffDashboardComponent },
  { path: 'client-dashboard', component: ClientDashboardComponent },
{ path: 'planner-profile/:plannerId', component: PlannerProfileComponent },
{ path: 'client-requests', component: ClientRequestsComponent },
{ path: 'forgot-password', component: ForgotPasswordComponent },
];
export class AppRoutingModule {}