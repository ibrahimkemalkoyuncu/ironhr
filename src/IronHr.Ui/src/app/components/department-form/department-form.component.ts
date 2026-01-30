import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container mt-5" style="max-width: 600px;">
      <div class="card shadow-lg border-0 rounded-4 animate__animated animate__fadeIn">
        <div class="card-header bg-success text-white p-4 rounded-top-4">
          <h3 class="mb-0 fw-bold">
            <i class="bi bi-diagram-3-fill me-2"></i>
            {{ isEdit ? 'Departman Güncelle' : 'Yeni Departman Tanımı' }}
          </h3>
          <p class="mb-0 opacity-75 small">Organizasyonel birim detaylarını giriniz.</p>
        </div>
        <div class="card-body p-4">
          <form [formGroup]="deptForm" (ngSubmit)="onSubmit()">
            
            <div class="mb-3">
              <label class="form-label fw-bold text-dark">Bağlı Şube</label>
              <select class="form-select border-2" formControlName="branchId"
                      [class.is-invalid]="f['branchId'].touched && f['branchId'].invalid">
                <option value="">Şube Seçiniz</option>
                @for (branch of branches(); track branch.id) {
                  <option [value]="branch.id">{{ branch.name }}</option>
                }
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold text-dark">Departman Adı</label>
              <input type="text" class="form-control border-2" formControlName="name"
                     placeholder="Örn: İnsan Kaynakları"
                     [class.is-invalid]="f['name'].touched && f['name'].invalid">
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold text-dark">Departman Kodu</label>
              <input type="text" class="form-control border-2" formControlName="code"
                     placeholder="Örn: HR-01">
            </div>

            <div class="form-check form-switch mb-4">
              <input class="form-check-input" type="checkbox" id="isActive" formControlName="isActive">
              <label class="form-check-label fw-bold text-dark" for="isActive">Departman Aktif</label>
            </div>

            <div class="d-flex gap-2 pt-3">
              <button type="submit" class="btn btn-success btn-lg flex-grow-1 rounded-pill shadow" [disabled]="deptForm.invalid || loading()">
                <i class="bi bi-check-circle me-1"></i>
                {{ isEdit ? 'Güncelle' : 'Departmanı Kaydet' }}
              </button>
              <a routerLink="/departments" class="btn btn-outline-secondary btn-lg rounded-pill">İptal</a>
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
export class DepartmentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly orgService = inject(OrganizationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  deptForm!: FormGroup;
  isEdit = false;
  loading = signal(false);
  message = signal<string | null>(null);
  isSuccess = signal(false);
  branches = signal<any[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;
    this.initForm(id);
    this.loadBranches();
    if (this.isEdit) this.loadDepartment(id!);
  }

  get f() { return this.deptForm.controls; }

  private initForm(id: string | null): void {
    this.deptForm = this.fb.group({
      id: [id],
      branchId: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      code: [''],
      isActive: [true]
    });
  }

  private loadBranches(): void {
    this.orgService.getBranches().subscribe(res => this.branches.set(res));
  }

  private loadDepartment(id: string): void {
    this.orgService.getDepartment(id).subscribe(res => {
      this.deptForm.patchValue(res);
    });
  }

  onSubmit(): void {
    if (this.deptForm.invalid) return;
    this.loading.set(true);
    this.message.set(null);

    const obs = this.isEdit 
      ? this.orgService.updateDepartment(this.deptForm.value.id, this.deptForm.value)
      : this.orgService.createDepartment(this.deptForm.value);

    obs.subscribe({
      next: () => {
        this.isSuccess.set(true);
        this.message.set('İşlem başarıyla tamamlandı. Listeye yönlendiriliyorsunuz...');
        setTimeout(() => this.router.navigate(['/departments']), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.isSuccess.set(false);
        this.message.set(err.error?.error?.message || 'Bir hata oluştu.');
      }
    });
  }
}
