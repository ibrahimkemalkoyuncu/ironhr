import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container mt-5" style="max-width: 700px;">
      <div class="card shadow-lg border-0 rounded-4 animate__animated animate__fadeIn">
        <div class="card-header bg-primary text-white p-4 rounded-top-4">
          <h3 class="mb-0 fw-bold">
            <i class="bi bi-geo-alt-fill me-2"></i>
            {{ isEdit ? 'Şube Güncelle' : 'Yeni Şube Kaydı' }}
          </h3>
          <p class="mb-0 opacity-75 small">Şube ve lokasyon bilgilerini tanımlayınız.</p>
        </div>
        <div class="card-body p-4">
          <form [formGroup]="branchForm" (ngSubmit)="onSubmit()">
            
            <div class="mb-3">
              <label class="form-label fw-bold text-dark">Bağlı Şirket</label>
              <select class="form-select border-2" formControlName="companyId"
                      [class.is-invalid]="f['companyId'].touched && f['companyId'].invalid">
                <option value="">Şirket Seçiniz</option>
                @for (company of companies(); track company.id) {
                  <option [value]="company.id">{{ company.name }}</option>
                }
              </select>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-8">
                <label class="form-label fw-bold text-dark">Şube Adı</label>
                <input type="text" class="form-control border-2" formControlName="name"
                       placeholder="Örn: İstanbul Merkez"
                       [class.is-invalid]="f['name'].touched && f['name'].invalid">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-bold text-dark">Şube Kodu</label>
                <input type="text" class="form-control border-2" formControlName="code"
                       placeholder="Örn: IST-001">
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold text-dark">Adres</label>
              <textarea class="form-control border-2" formControlName="address" rows="3"></textarea>
            </div>

            <div class="form-check form-switch mb-4">
              <input class="form-check-input" type="checkbox" id="isActive" formControlName="isActive">
              <label class="form-check-label fw-bold text-dark" for="isActive">Şube Aktif</label>
            </div>

            <div class="d-flex gap-2 pt-3">
              <button type="submit" class="btn btn-success btn-lg flex-grow-1 rounded-pill shadow" [disabled]="branchForm.invalid || loading()">
                <i class="bi bi-check-circle me-1"></i>
                {{ isEdit ? 'Değişiklikleri Kaydet' : 'Şubeyi Oluştur' }}
              </button>
              <a routerLink="/branches" class="btn btn-outline-secondary btn-lg rounded-pill">İptal</a>
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
export class BranchFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly orgService = inject(OrganizationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  branchForm!: FormGroup;
  isEdit = false;
  loading = signal(false);
  message = signal<string | null>(null);
  isSuccess = signal(false);
  companies = signal<any[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;
    this.initForm(id);
    this.loadCompanies();
    if (this.isEdit) this.loadBranch(id!);
  }

  get f() { return this.branchForm.controls; }

  private initForm(id: string | null): void {
    this.branchForm = this.fb.group({
      id: [id],
      companyId: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      code: [''],
      address: [''],
      isActive: [true]
    });
  }

  private loadCompanies(): void {
    this.orgService.getCompanies().subscribe(res => this.companies.set(res));
  }

  private loadBranch(id: string): void {
    this.orgService.getBranch(id).subscribe(res => {
      this.branchForm.patchValue(res);
    });
  }

  onSubmit(): void {
    if (this.branchForm.invalid) return;
    this.loading.set(true);
    this.message.set(null);

    const obs = this.isEdit 
      ? this.orgService.updateBranch(this.branchForm.value.id, this.branchForm.value)
      : this.orgService.createBranch(this.branchForm.value);

    obs.subscribe({
      next: () => {
        this.isSuccess.set(true);
        this.message.set('İşlem başarıyla tamamlandı. Listeye yönlendiriliyorsunuz...');
        setTimeout(() => this.router.navigate(['/branches']), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.isSuccess.set(false);
        this.message.set(err.error?.error?.message || 'Bir hata oluştu.');
      }
    });
  }
}
