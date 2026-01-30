import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { OrganizationService } from '../../services/organization.service';

/**
 * IRONHR - PERSONEL KAYIT EKRANI (PERSONNEL CREATE COMPONENT)
 * Yeni bir personelin sisteme dahil edildiği, modern ve validasyonlu form yapısı.
 */
@Component({
  selector: 'app-personnel-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-5 px-lg-5 animate__animated animate__fadeIn">
      <div class="row justify-content-center">
        <div class="col-xl-9">
          <!-- Üst Bilgi ve Geri Dönüş -->
          <div class="d-flex justify-content-between align-items-center mb-4 px-3">
             <div>
                <h1 class="h2 fw-800 text-dark mb-1">Yeni Personel Katılımı</h1>
                <p class="text-muted small mb-0">Organizasyonunuza yeni bir yetenek kazandırın.</p>
             </div>
             <a routerLink="/employees" class="btn btn-link text-decoration-none text-secondary fw-bold">
                <i class="bi bi-arrow-left me-2"></i>Personel Listesi
             </a>
          </div>

          <!-- Ana Form Kartı -->
          <div class="card glass-card border-0 rounded-4 shadow-lg overflow-hidden position-relative mb-5">
            <div class="bg-decoration-form"></div>
            
            <div class="card-body p-4 p-md-5 position-relative">
              <form [formGroup]="personnelForm" (ngSubmit)="onSubmit()" class="row g-4">
                
                <h5 class="col-12 text-primary fw-800 d-flex align-items-center mb-1">
                  <span class="step-indicator me-3">1</span>
                  Yönetsel Yerleştirme
                </h5>
                <p class="col-12 text-muted small mt-0 mb-4 ps-5">Personelin bağlı olacağı şirket, şube ve departman bilgilerini seçiniz.</p>

                <div class="col-md-4">
                  <div class="form-floating-custom">
                    <label class="custom-label">Şirket</label>
                    <select class="form-select modern-select" (change)="onCompanyChange($event)">
                      <option value="">Seçiniz...</option>
                      @for (company of companies(); track company.id) {
                        <option [value]="company.id">{{ company.name }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="form-floating-custom">
                    <label class="custom-label">Şube</label>
                    <select class="form-select modern-select" formControlName="branchId" (change)="onBranchChange($event)"
                            [class.is-invalid]="f['branchId'].touched && f['branchId'].invalid">
                      <option value="">Şirket Seçiniz</option>
                      @for (branch of branches(); track branch.id) {
                        <option [value]="branch.id">{{ branch.name }} ({{ branch.code }})</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="form-floating-custom">
                    <label class="custom-label">Departman</label>
                    <select class="form-select modern-select" formControlName="departmentId"
                            [class.is-invalid]="f['departmentId'].touched && f['departmentId'].invalid">
                      <option value="">Şube Seçiniz</option>
                      @for (dept of departments(); track dept.id) {
                        <option [value]="dept.id">{{ dept.name }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="col-12 my-3"><hr class="border-light opacity-10"></div>

                <h5 class="col-12 text-primary fw-800 d-flex align-items-center mb-1">
                  <span class="step-indicator me-3">2</span>
                  Kişisel & Kimlik Bilgileri
                </h5>
                <p class="col-12 text-muted small mt-0 mb-4 ps-5">Resmi evraklara uygun kimlik ve özlük verilerini eksiksiz doldurunuz.</p>

                <div class="col-md-6">
                  <div class="form-group">
                    <label class="custom-label">Ad</label>
                    <input type="text" class="form-control modern-input" formControlName="firstName" 
                           [class.is-invalid]="f['firstName'].touched && f['firstName'].invalid" placeholder="Örn: Ahmet">
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-group">
                    <label class="custom-label">Soyad</label>
                    <input type="text" class="form-control modern-input" formControlName="lastName"
                           [class.is-invalid]="f['lastName'].touched && f['lastName'].invalid" placeholder="Örn: Yılmaz">
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-group">
                    <label class="custom-label">T.C. Kimlik No</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0"><i class="bi bi-shield-lock"></i></span>
                      <input type="text" class="form-control modern-input border-start-0" formControlName="identityNumber" maxlength="11"
                             [class.is-invalid]="f['identityNumber'].touched && f['identityNumber'].invalid">
                    </div>
                    <div class="invalid-feedback d-block" *ngIf="f['identityNumber'].touched && f['identityNumber'].errors?.['tcInvalid']">
                      Lütfen geçerli bir T.C. Kimlik numarası giriniz.
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-group">
                    <label class="custom-label">Sicil Numarası</label>
                    <input type="text" class="form-control modern-input font-monospace" formControlName="registrationNumber" placeholder="SIC-XXXX">
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
                    <input type="date" class="form-control modern-input text-success fw-bold" formControlName="hireDate">
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-group">
                    <label class="custom-label">E-Posta (İş)</label>
                    <input type="email" class="form-control modern-input" formControlName="email" placeholder="personel@sirket.com">
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-group">
                    <label class="custom-label">Telefon</label>
                    <input type="text" class="form-control modern-input" formControlName="phoneNumber" placeholder="05XX XXX XX XX">
                  </div>
                </div>

                <div class="col-12 my-3"><hr class="border-light opacity-10"></div>

                <h5 class="col-12 text-primary fw-800 d-flex align-items-center mb-1">
                  <span class="step-indicator me-3">3</span>
                  Mali Parametreler
                </h5>
                <p class="col-12 text-muted small mt-0 mb-4 ps-5">Ücretlendirme ve bordro hesaplaması için gerekli baz verileri giriniz.</p>

                <div class="col-md-6">
                  <div class="form-group">
                    <label class="custom-label">Maaş Tipi</label>
                    <div class="btn-group w-100" role="group">
                      <input type="radio" class="btn-check" name="salaryType" id="net" [value]="0" formControlName="salaryType">
                      <label class="btn btn-outline-primary py-2 fw-bold" for="net">NET MAAŞ</label>
                      <input type="radio" class="btn-check" name="salaryType" id="gross" [value]="1" formControlName="salaryType">
                      <label class="btn btn-outline-primary py-2 fw-bold" for="gross">BRÜT MAAŞ</label>
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-group">
                    <label class="custom-label">Baz Ücret (Aylık)</label>
                    <div class="input-group">
                      <input type="number" class="form-control modern-input border-end-0 fw-bold fs-5" formControlName="baseSalary" placeholder="0.00">
                      <span class="input-group-text bg-white border-start-0 text-success fw-bold">₺</span>
                    </div>
                  </div>
                </div>

                <div class="col-12 mt-5 text-center">
                  <button type="submit" class="btn btn-primary btn-lg rounded-pill px-5 shadow-lg fw-bold transition" [disabled]="personnelForm.invalid || loading()">
                    <ng-container *ngIf="!loading()">
                      <i class="bi bi-person-check-fill me-2"></i>Personel Kayıt İşlemini Tamamla
                    </ng-container>
                    <div *ngIf="loading()" class="d-flex align-items-center justify-content-center">
                       <span class="spinner-border spinner-border-sm me-2"></span>
                       Sisteme İşleniyor...
                    </div>
                  </button>
                </div>

              </form>

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
    
    .step-indicator { width: 32px; height: 32px; background: #0d6efd; color: white; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 800; box-shadow: 0 4px 6px rgba(13, 110, 253, 0.3); }
    
    .custom-label { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block; }
    .modern-input, .modern-select { border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; font-weight: 500; transition: all 0.2s; }
    .modern-input:focus, .modern-select:focus { border-color: #0d6efd; box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.1); background-color: white; }
    
    .btn-outline-primary { border-width: 1.5px; border-radius: 12px; }
    .btn-check:checked + .btn-outline-primary { box-shadow: 0 4px 10px rgba(13, 110, 253, 0.2); }
    
    .transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .transition:hover { transform: translateY(-2px); }
  `]
})
export class PersonnelCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly organizationService = inject(OrganizationService);

  personnelForm!: FormGroup;
  loading = signal(false);
  message = signal<string | null>(null);
  isSuccess = signal(false);

  // Dropdown Verileri
  companies = signal<any[]>([]);
  branches = signal<any[]>([]);
  departments = signal<any[]>([]);

  ngOnInit(): void {
    this.initForm();
    this.loadCompanies();
  }

  get f() { return this.personnelForm.controls; }

  private initForm(): void {
    this.personnelForm = this.fb.group({
      branchId: ['', [Validators.required]],
      departmentId: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      identityNumber: ['', [Validators.required, this.tcNoValidator]],
      registrationNumber: ['', [Validators.required]],
      email: ['', [Validators.email]],
      phoneNumber: [''],
      birthDate: ['', [Validators.required]],
      hireDate: [new Date().toISOString().split('T')[0], [Validators.required]],
      baseSalary: [null, [Validators.min(0)]],
      salaryType: [0]
    });
  }

  private loadCompanies(): void {
    this.organizationService.getCompanies().subscribe(res => this.companies.set(res));
  }

  onCompanyChange(event: any): void {
    const companyId = event.target.value;
    this.branches.set([]);
    this.departments.set([]);
    this.personnelForm.patchValue({ branchId: '', departmentId: '' });
    
    if (companyId) {
      this.organizationService.getBranches(companyId).subscribe(res => this.branches.set(res));
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

  /**
   * T.C. Kimlik No Doğrulama (Frontend Yanı)
   */
  private tcNoValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    if (value.length !== 11 || !/^\d+$/.test(value) || value[0] === '0') {
      return { tcInvalid: true };
    }

    const digits = value.split('').map(Number);
    const sumOdd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const sumEven = digits[1] + digits[3] + digits[5] + digits[7];
    
    const d10 = (sumOdd * 7 - sumEven) % 10;
    const d11 = (digits.slice(0, 10).reduce((a: number, b: number) => a + b, 0)) % 10;

    if (digits[9] !== d10 || digits[10] !== d11) {
      return { tcInvalid: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.personnelForm.invalid) return;

    this.loading.set(true);
    this.message.set(null);

    this.employeeService.createEmployee(this.personnelForm.value).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.isSuccess.set(true);
        this.message.set('Personel başarıyla kaydedildi.');
        this.personnelForm.reset();
        this.initForm(); // Tarih vb. varsayılanlar için tekrar init
      },
      error: (err) => {
        this.loading.set(false);
        this.isSuccess.set(false);
        this.message.set(err.error?.error?.message || 'Bir hata oluştu.');
      }
    });
  }
}
