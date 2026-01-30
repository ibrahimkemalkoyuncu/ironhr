import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LeaveService } from '../../services/leave.service';
import { EmployeeService } from '../../services/employee.service';

/**
 * IRONHR - İZİN TALEBİ OLUŞTURMA (LEAVE REQUEST COMPONENT)
 */
@Component({
  selector: 'app-leave-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card shadow-lg border-0 rounded-4 animate__animated animate__fadeIn">
            <div class="card-header bg-success text-white p-4 rounded-top-4">
              <h2 class="mb-0 fs-3 fw-bold">
                <i class="bi bi-airplane-engines-fill me-2"></i>Yeni İzin Talebi
              </h2>
              <p class="mb-0 opacity-75">
                @if (employee(); as emp) {
                  {{ emp.firstName }} {{ emp.lastName }} için izin kaydı oluşturun.
                }
              </p>
            </div>

            <div class="card-body p-4">
              <!-- İzin Bakiyesi Özeti -->
              <div class="alert alert-info border-0 shadow-sm rounded-3 d-flex align-items-center mb-4">
                <i class="bi bi-info-circle-fill fs-4 me-3"></i>
                <div>
                   <strong>Kalan Yıllık İzin Bakiyesi:</strong> {{ balance()?.remainingDays || 0 }} Gün
                </div>
              </div>

              <form [formGroup]="leaveForm" (ngSubmit)="onSubmit()" class="row g-3">
                <div class="col-md-12">
                  <label class="form-label fw-bold">İzin Türü</label>
                  <select class="form-select" formControlName="leaveTypeId"
                          [class.is-invalid]="f['leaveTypeId'].touched && f['leaveTypeId'].invalid">
                    <option value="">Lütfen seçim yapınız...</option>
                    @for (type of leaveTypes(); track type.id) {
                      <option [value]="type.id">{{ type.name }} {{ type.isPaid ? '(Ücretli)' : '(Ücretsiz)' }}</option>
                    }
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-bold">Başlangıç Tarihi</label>
                  <input type="date" class="form-control" formControlName="startDate"
                         [class.is-invalid]="f['startDate'].touched && f['startDate'].invalid">
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-bold">Bitiş Tarihi</label>
                  <input type="date" class="form-control" formControlName="endDate"
                         [class.is-invalid]="f['endDate'].touched && f['endDate'].invalid">
                </div>

                <div class="col-12">
                  <label class="form-label fw-bold">Açıklama</label>
                  <textarea class="form-control" rows="3" formControlName="description" 
                            placeholder="İzin gerekçesi veya detaylar..."></textarea>
                </div>

                <div class="col-12 mt-4">
                  <div class="d-flex gap-2">
                    <button type="button" class="btn btn-light px-4 py-2" (click)="goBack()">İptal</button>
                    <button type="submit" class="btn btn-success flex-grow-1 py-2 fw-bold shadow-sm" [disabled]="leaveForm.invalid || loading()">
                       @if (loading()) {
                         <span class="spinner-border spinner-border-sm me-2"></span> İşleniyor...
                       } @else {
                         <i class="bi bi-check2-circle me-2"></i>Talebi Gönder
                       }
                    </button>
                  </div>
                </div>
              </form>

              @if (message()) {
                <div class="mt-4 alert animate__animated animate__headShake" [class.alert-success]="isSuccess()" [class.alert-danger]="!isSuccess()">
                  {{ message() }}
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 900px; }
    .card-header { background: linear-gradient(135deg, #198754 0%, #157347 100%) !important; }
  `]
})
export class LeaveRequestComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly leaveService = inject(LeaveService);
  private readonly employeeService = inject(EmployeeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  leaveForm!: FormGroup;
  employeeId: string | null = null;
  employee = signal<any>(null);
  balance = signal<any>(null);
  leaveTypes = signal<any[]>([]);
  loading = signal(false);
  message = signal<string | null>(null);
  isSuccess = signal(false);

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    this.initForm();
    if (this.employeeId) {
      this.loadInitialData(this.employeeId);
    }
  }

  get f() { return this.leaveForm.controls; }

  private initForm(): void {
    this.leaveForm = this.fb.group({
      employeeId: [this.employeeId, [Validators.required]],
      leaveTypeId: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      description: ['']
    });
  }

  private loadInitialData(id: string): void {
    this.employeeService.getEmployee(id).subscribe(res => this.employee.set(res));
    this.leaveService.getLeaveBalance(id).subscribe(res => this.balance.set(res));
    this.leaveService.getLeaveTypes().subscribe(res => this.leaveTypes.set(res));
  }

  onSubmit(): void {
    if (this.leaveForm.invalid) return;

    this.loading.set(true);
    this.message.set(null);

    this.leaveService.requestLeave(this.leaveForm.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.isSuccess.set(true);
        this.message.set('İzin talebi başarıyla oluşturuldu! Yönlendiriliyorsunuz...');
        setTimeout(() => this.goBack(), 2000);
      },
      error: (err) => {
        this.loading.set(false);
        this.isSuccess.set(false);
        this.message.set(err.error?.error?.message || 'Bir hata oluştu.');
      }
    });
  }

  goBack(): void {
    if (this.employeeId) {
      this.router.navigate(['/employees', this.employeeId]);
    } else {
      this.router.navigate(['/employees']);
    }
  }
}
