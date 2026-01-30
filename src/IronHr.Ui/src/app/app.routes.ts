import { Routes } from '@angular/router';
import { CompanyCreateComponent } from './features/companies/company-create/company-create.component';
import { PersonnelCreateComponent } from './components/personnel-create/personnel-create.component';
import { PersonnelListComponent } from './components/personnel-list/personnel-list.component';
import { PersonnelDetailComponent } from './components/personnel-detail/personnel-detail.component';
import { PersonnelUpdateComponent } from './components/personnel-update/personnel-update.component';
import { LeaveRequestComponent } from './components/leave-request/leave-request.component';
import { LeaveManagementComponent } from './components/leave-management/leave-management.component';
import { LeaveCalendarComponent } from './components/leave-calendar/leave-calendar.component';
import { BranchListComponent } from './components/branch-list/branch-list.component';
import { BranchFormComponent } from './components/branch-form/branch-form.component';
import { DepartmentListComponent } from './components/department-list/department-list.component';
import { DepartmentFormComponent } from './components/department-form/department-form.component';
import { CompanyListComponent } from './components/company-list/company-list.component';
import { CompanyFormComponent } from './components/company-form/company-form.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'companies', component: CompanyListComponent },
  { path: 'companies/create', component: CompanyFormComponent },
  { path: 'companies/edit/:id', component: CompanyFormComponent },
  { path: 'employees', component: PersonnelListComponent },
  { path: 'employees/create', component: PersonnelCreateComponent },
  { path: 'employees/:id', component: PersonnelDetailComponent },
  { path: 'employees/edit/:id', component: PersonnelUpdateComponent },
  { path: 'leaves/request/:id', component: LeaveRequestComponent },
  { path: 'leaves/manage', component: LeaveManagementComponent },
  { path: 'leaves/calendar', component: LeaveCalendarComponent },
  { path: 'branches', component: BranchListComponent },
  { path: 'branches/create', component: BranchFormComponent },
  { path: 'branches/edit/:id', component: BranchFormComponent },
  { path: 'departments', component: DepartmentListComponent },
  { path: 'departments/create', component: DepartmentFormComponent },
  { path: 'departments/edit/:id', component: DepartmentFormComponent }
];
