import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { OrganizationService } from '../../services/organization.service';

/**
 * IRONHR - PERSONEL GÜNCELLEME EKRANI (PERSONNEL UPDATE COMPONENT)
 * Mevcut personelin bilgilerinin revize edildiği ekran.
 */
@Component({
  selector: 'app-personnel-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid py-5 px-lg-5 animate__animated animate__fadeIn">
      <div class="row justify-content-center">
        <div class="col-xl-9">
          <!-- Üst Bilgi ve Aksiyonlar -->
          <div class="d-flex justify-content-between align-items-center mb-4 px-3">
             <div>
                <nav aria-label="breadcrumb">
                  <ol class="breadcrumb mb-1">
                    <li class="breadcrumb-item"><a routerLink="/employees" class="text-decoration-none text-muted">Personeller</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Güncelle</li>
                  </ol>
                </nav>
                <h1 class="h2 fw-800 text-dark mb-1">Bilgileri Güncelle</h1>
                <p class="text-muted small mb-0">{{ personnelForm.get('firstName')?.value }} {{ personnelForm.get('lastName')?.value }} için kayıt revizyonu.</p>
             </div>
             <div class="d-flex gap-2">
                <a [routerLink]="['/employees', employeeId]" class="btn btn-outline-info rounded-pill px-3 fw-bold">
                   <i class="bi bi-eye me-2"></i>Profili Gör
                </a>
                <a routerLink="/employees" class="btn btn-link text-decoration-none text-secondary fw-bold">
                   <i class="bi bi-arrow-left me-1"></i>Listeye Dön
                </a>
             </div>
          </div>

          <!-- Ana Form Kartı -->
          <div class="card glass-card border-0 rounded-4 shadow-lg overflow-hidden position-relative mb-5">
            <div class="bg-decoration-form edit-mode"></div>
            
            <div class="card-body p-4 p-md-5 position-relative">
              @if (fetching()) {
                <div class="text-center py-5">
                  <div class="spinner-grow text-primary" role="status"></div>
                  <p class="mt-3 fw-bold text-muted">Personel Verileri Çekiliyor...</p>
                </div>
              } @else {
                <form [formGroup]="personnelForm" (ngSubmit)="onSubmit()" class="row g-4">
                  
                  <h5 class="col-12 text-primary fw-800 d-flex align-items-center mb-1">
                    <i class="bi bi-building-gear me-3 fs-4"></i>Organizasyonel Yapı
                  </h5>
                  
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="custom-label">Bağlı Olduğu Şube</label>
                      <select class="form-select modern-select" formControlName="branchId" (change)="onBranchChange($event)"
                              [class.is-invalid]="f['branchId'].touched && f['branchId'].invalid">
                        <option value="">Şube Seçiniz</option>
                        @for (branch of branches(); track branch.id) {
                          <option [value]="branch.id">{{ branch.name }}</option>
                        }
                      </select>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="custom-label">Departman / Birim</label>
                      <select class="form-select modern-select" formControlName="departmentId"
                              [class.is-invalid]="f['departmentId'].touched && f['departmentId'].invalid">
                        <option value="">Departman Seçiniz</option>
                        @for (dept of departments(); track dept.id) {
                          <option [value]="dept.id">{{ dept.name }}</option>
                        }
                      </select>
                    </div>
                  </div>

                  <div class="col-12 my-3"><hr class="border-light opacity-10"></div>

                  <h5 class="col-12 text-primary fw-800 d-flex align-items-center mb-1">
                    <i class="bi bi-person-badge-fill me-3 fs-4"></i>Temel Personel Bilgileri
                  </h5>

                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="custom-label">Ad</label>
                      <input type="text" class="form-control modern-input" formControlName="firstName" 
                             [class.is-invalid]="f['firstName'].touched && f['firstName'].invalid">
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="custom-label">Soyad</label>
                      <input type="text" class="form-control modern-input" formControlName="lastName"
                             [class.is-invalid]="f['lastName'].touched && f['lastName'].invalid">
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="custom-label">T.C. Kimlik Numarası</label>
                      <input type="text" class="form-control modern-input bg-light border-0 opacity-75" [value]="identityNumber()" readonly>
                      <small class="text-muted d-block mt-1 ps-2" style="font-size: 0.65rem;">
                        <i class="bi bi-info-circle me-1"></i>Kimlik numarası değiştirilemez bir alandır.
                      </small>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="custom-label">Sicil No / Kod</label>
                      <input type="text" class="form-control modern-input font-monospace fw-bold" formControlName="registrationNumber">
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="custom-label">E-Posta Adresi</label>
                      <input type="email" class="form-control modern-input" formControlName="email">
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="custom-label">Telefon Numarası</label>
                      <input type="text" class="form-control modern-input" formControlName="phoneNumber">
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="custom-label">Doğum Tarihi</label>
                      <input type="date" class="form-control modern-input" formControlName="birthDate">
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="custom-label">İşe Giriş Tarihi</label>
                      <input type="date" class="form-control modern-input" formControlName="hireDate">
                    </div>
                  </div>

                  <div class="col-12 my-3"><hr class="border-light opacity-10"></div>

                  <h5 class="col-12 text-primary fw-800 d-flex align-items-center mb-1">
                    <i class="bi bi-wallet2 me-3 fs-4"></i>Finansal & Statü Tanımları
                  </h5>

                  <div class="col-md-4">
                    <div class="form-group">
                      <label class="custom-label">Maaş Türü</label>
                      <select class="form-select modern-select" formControlName="salaryType">
                        <option [value]="0">Net Maaş</option>
                        <option [value]="1">Brüt Maaş</option>
                      </select>
                    </div>
                  </div>

                  <div class="col-md-5">
                    <div class="form-group">
                      <label class="custom-label">Güncel Baz Maaş</label>
                      <div class="input-group">
                        <input type="number" class="form-control modern-input border-end-0 fw-bold fs-5" formControlName="baseSalary">
                        <span class="input-group-text bg-white border-start-0 text-success fw-bold">₺</span>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-3">
                    <div class="form-group h-100 d-flex align-items-end pb-2">
                      <div class="form-check form-switch p-3 border rounded-4 bg-light w-100 ps-5 ms-0 transition hover-bg-light">
                        <input class="form-check-input ms-n4" type="checkbox" id="isActive" formControlName="isActive">
                        <label class="form-check-label fw-800 ms-1" for="isActive">Aktif Kayıt</label>
                      </div>
                    </div>
                  </div>

                  <div class="col-12 mt-5">
                    <button type="submit" class="btn btn-primary btn-lg w-100 rounded-pill shadow-lg p-3 fw-bold transition" [disabled]="personnelForm.invalid || loading()">
                      <ng-container *ngIf="!loading()">
                        <i class="bi bi-cloud-arrow-up-fill me-2 fs-5"></i>Değişiklikleri Veritabanına Kaydet
                      </ng-container>
                      <div *ngIf="loading()" class="d-flex align-items-center justify-content-center">
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Sunucuya İletiliyor...
                      </div>
                    </button>
                  </div>

                </form>
              }

              <div *ngIf="message()" class="mt-5 alert animate__animated animate__fadeInUp border-0 rounded-4 p-3 d-flex align-items-center shadow-sm" 
                   [class.alert-success]="isSuccess()" [class.alert-danger]="!isSuccess()" 
                   [style.background-color]="isSuccess() ? '#ecfdf5' : '#fef2f2'">
                <div [class.bg-success]="isSuccess()" [class.bg-danger]="!isSuccess()" 
                     class="rounded-circle d-flex align-items-center justify-content-center text-white me-3" 
                     style="width: 40px; height: 40px; flex-shrink: 0;">
                  <i class="bi fs-5" [class.bi-check2-all]="isSuccess()" [class.bi-exclamation-triangle-fill]="!isSuccess()"></i>
                </div>
                <div class="fw-bold" [class.text-success]="isSuccess()" [class.text-danger]="!isSuccess()">
                  {{ message() }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fw-800 { font-weight: 800; }
    .glass-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.5); }
    .bg-decoration-form { position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(13, 110, 253, 0.05) 0%, transparent 70%); z-index: 0; }
    .bg-decoration-form.edit-mode { top: auto; bottom: -100px; left: -100px; right: auto; background: radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%); }
    
    .custom-label { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block; }
    .modern-input, .modern-select { border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; font-weight: 500; transition: all 0.2s; }
    .modern-input:focus, .modern-select:focus { border-color: #0d6efd; box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.1); background-color: white; }
    
    .form-check-input:checked { background-color: #10b981; border-color: #10b981; }
    .hover-bg-light:hover { background-color: #e2e8f0 !important; }
    
    .transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .transition:hover { transform: translateY(-2px); }
  `]
})
export class PersonnelUpdateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);
  private readonly organizationService = inject(OrganizationService);

  personnelForm!: FormGroup;
  loading = signal(false);
  fetching = signal(true);
  message = signal<string | null>(null);
  isSuccess = signal(false);
  
  employeeId: string = '';
  identityNumber = signal('');

  branches = signal<any[]>([]);
  departments = signal<any[]>([]);

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id') || '';
    this.initForm();
    this.loadInitialData();
  }

  get f() { return this.personnelForm.controls; }

  private initForm(): void {
    this.personnelForm = this.fb.group({
      id: [this.employeeId],
      branchId: ['', [Validators.required]],
      departmentId: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      registrationNumber: ['', [Validators.required]],
      email: ['', [Validators.email]],
      phoneNumber: [''],
      birthDate: ['', [Validators.required]],
      hireDate: ['', [Validators.required]],
      baseSalary: [null, [Validators.min(0)]],
      salaryType: [0],
      isActive: [true]
    });
  }

  private async loadInitialData() {
    try {
      // Önce tüm şubeleri yükleyelim (güncellemede şirket filtresi opsiyonel tutuldu)
      this.organizationService.getBranches().subscribe(res => this.branches.set(res));
      
      this.employeeService.getEmployee(this.employeeId).subscribe({
        next: (emp) => {
          this.identityNumber.set(emp.identityNumber);
          
          // Mevcut şubeye ait departmanları yükleyelim
          this.organizationService.getDepartments(emp.branchId).subscribe(depts => {
            this.departments.set(depts);
            
            // Formu doldur
            this.personnelForm.patchValue({
              branchId: emp.branchId,
              departmentId: emp.departmentId,
              firstName: emp.firstName,
              lastName: emp.lastName,
              registrationNumber: emp.registrationNumber,
              email: emp.email,
              phoneNumber: emp.phoneNumber,
              birthDate: emp.birthDate.split('T')[0],
              hireDate: emp.hireDate.split('T')[0],
              baseSalary: emp.baseSalary,
              salaryType: emp.salaryType ?? 0,
              isActive: emp.isActive
            });
            this.fetching.set(false);
          });
        },
        error: () => {
          this.message.set('Personel bilgileri yüklenemedi.');
          this.fetching.set(false);
        }
      });
    } catch (error) {
      this.fetching.set(false);
    }
  }

  onBranchChange(event: any): void {
    const branchId = event.target.value;
    this.departments.set([]);
    this.personnelForm.patchValue({ departmentId: '' });

    if (branchId) {
      this.organizationService.getDepartments(branchId).subscribe(res => this.departments.set(res));
    }
  }

  onSubmit(): void {
    if (this.personnelForm.invalid) return;

    this.loading.set(true);
    this.message.set(null);

    this.employeeService.updateEmployee(this.employeeId, this.personnelForm.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.isSuccess.set(true);
        this.message.set('Bilgiler başarıyla güncellendi. Listeye yönlendiriliyorsunuz...');
        setTimeout(() => this.router.navigate(['/employees']), 2000);
      },
      error: (err) => {
        this.loading.set(false);
        this.isSuccess.set(false);
        this.message.set(err.error?.error?.message || 'Bir hata oluştu.');
      }
    });
  }
}
