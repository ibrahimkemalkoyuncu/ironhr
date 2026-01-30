import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container mt-5" style="max-width: 700px;">
      <div class="card shadow-lg border-0 rounded-4 animate__animated animate__fadeIn">
        <div class="card-header bg-primary text-white p-4 rounded-top-4">
          <h3 class="mb-0 fw-bold">
            <i class="bi bi-building-fill me-2"></i>
            {{ isEdit ? 'Şirket Bilgilerini Güncelle' : 'Yeni Şirket Tanımı' }}
          </h3>
          <p class="mb-0 opacity-75 small">Yasal şirket bilgilerini ve iletişim detaylarını giriniz.</p>
        </div>
        <div class="card-body p-4">
          <form [formGroup]="companyForm" (ngSubmit)="onSubmit()">
            
            <div class="mb-3">
              <label class="form-label fw-bold text-dark">Şirket Ünvanı</label>
              <input type="text" class="form-control border-2" formControlName="name"
                     placeholder="Örn: Özdemir Tekstil San. ve Tic. A.Ş."
                     [class.is-invalid]="f['name'].touched && f['name'].invalid">
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark">Vergi Numarası</label>
                <input type="text" class="form-control border-2" formControlName="taxNumber"
                       placeholder="10 Haneli"
                       [class.is-invalid]="f['taxNumber'].touched && f['taxNumber'].invalid">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold text-dark">Vergi Dairesi</label>
                <input type="text" class="form-control border-2" formControlName="taxOffice"
                       placeholder="Örn: Zincirlikuyu V.D.">
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold text-dark">Adres</label>
              <textarea class="form-control border-2" formControlName="address" rows="3"
                        placeholder="Şirket resmi adresi..."></textarea>
            </div>

            <div class="form-check form-switch mb-4">
              <input class="form-check-input" type="checkbox" id="isActive" formControlName="isActive">
              <label class="form-check-label fw-bold text-dark" for="isActive">Şirket Aktif</label>
            </div>

            <div class="d-flex gap-2 pt-3">
              <button type="submit" class="btn btn-primary btn-lg flex-grow-1 rounded-pill shadow" [disabled]="companyForm.invalid || loading()">
                <i class="bi bi-check-circle me-1"></i>
                {{ isEdit ? 'Değişiklikleri Kaydet' : 'Şirketi Kaydet' }}
              </button>
              <a routerLink="/companies" class="btn btn-outline-secondary btn-lg rounded-pill px-4">İptal</a>
            </div>
          </form>

          @if (message()) {
            <div class="mt-4 alert" [class.alert-success]="isSuccess()" [class.alert-danger]="!isSuccess()">
              {{ message() }}
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class CompanyFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly orgService = inject(OrganizationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  companyForm!: FormGroup;
  isEdit = false;
  loading = signal(false);
  message = signal<string | null>(null);
  isSuccess = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;
    this.initForm(id);
    if (this.isEdit) this.loadCompany(id!);
  }

  get f() { return this.companyForm.controls; }

  private initForm(id: string | null): void {
    this.companyForm = this.fb.group({
      id: [id],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      taxNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
      taxOffice: ['', [Validators.maxLength(100)]],
      address: ['', [Validators.required]],
      isActive: [true]
    });
  }

  private loadCompany(id: string): void {
    this.orgService.getCompany(id).subscribe(res => {
      this.companyForm.patchValue(res);
    });
  }

  onSubmit(): void {
    if (this.companyForm.invalid) return;
    this.loading.set(true);
    this.message.set(null);

    const obs = this.isEdit 
      ? this.orgService.updateCompany(this.companyForm.value.id, this.companyForm.value)
      : this.orgService.createCompany(this.companyForm.value);

    obs.subscribe({
      next: () => {
        this.isSuccess.set(true);
        this.message.set('Şirket işlemi başarıyla tamamlandı. Listeye yönlendiriliyorsunuz...');
        setTimeout(() => this.router.navigate(['/companies']), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.isSuccess.set(false);
        this.message.set(err.error?.error?.message || 'Bir hata oluştu.');
      }
    });
  }
}
