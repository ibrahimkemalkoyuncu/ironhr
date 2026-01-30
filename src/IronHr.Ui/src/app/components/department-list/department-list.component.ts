import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container mt-4 animate__animated animate__fadeIn">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold text-success mb-0">
          <i class="bi bi-diagram-3-fill me-2"></i>Departman Yönetimi
        </h2>
        <a routerLink="/departments/create" class="btn btn-success rounded-pill px-4 shadow-sm">
          <i class="bi bi-plus-lg me-2"></i>Yeni Departman
        </a>
      </div>

      <!-- Filtreleme Alanı -->
      <div class="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-light bg-opacity-50">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0 border-2">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input type="text" class="form-control border-start-0 border-2" 
                     placeholder="Departman adı veya koduna göre ara..."
                     [(ngModel)]="searchTerm">
            </div>
          </div>
          <div class="col-md-4">
            <select class="form-select border-2" [(ngModel)]="selectedBranchId">
              <option value="">Tüm Şubeler</option>
              @for (branch of branches(); track branch.id) {
                <option [value]="branch.id">{{ branch.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-secondary w-100 border-2" (click)="resetFilters()">
              <i class="bi bi-arrow-counterclockwise me-1"></i>Sıfırla
            </button>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light text-uppercase small fw-bold">
              <tr>
                <th class="ps-4 py-3">Departman Adı</th>
                <th>Kod</th>
                <th>Bağlı Şube</th>
                <th class="text-center">Durum</th>
                <th class="text-center pe-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              @for (dept of filteredDepartments(); track dept.id) {
                <tr class="animate__animated animate__fadeIn">
                  <td class="ps-4 fw-bold text-dark">{{ dept.name }}</td>
                  <td><span class="badge bg-light text-dark border">{{ dept.code || '-' }}</span></td>
                  <td>
                    <span class="text-muted"><i class="bi bi-geo-alt me-1"></i>{{ dept.branchName }}</span>
                  </td>
                  <td class="text-center">
                    <span class="badge rounded-pill" [class.bg-success]="dept.isActive" [class.bg-danger]="!dept.isActive">
                      {{ dept.isActive ? 'Aktif' : 'Pasif' }}
                    </span>
                  </td>
                  <td class="text-center pe-4">
                    <a [routerLink]="['/departments/edit', dept.id]" class="btn btn-sm btn-outline-success rounded-pill px-3">
                      <i class="bi bi-pencil-square me-1"></i>Düzenle
                    </a>
                  </td>
                </tr>
              }
              @if (filteredDepartments().length === 0) {
                <tr>
                  <td colspan="5" class="text-center py-5 text-muted">
                    <div class="display-6 opacity-25 mb-2"><i class="bi bi-search"></i></div>
                    Arama kriterlerine uygun departman bulunamadı.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-control:focus, .form-select:focus { border-color: #198754; box-shadow: none; }
    .input-group-text { border-color: #dee2e6; }
  `]
})
export class DepartmentListComponent implements OnInit {
  private readonly orgService = inject(OrganizationService);
  
  departments = signal<any[]>([]);
  branches = signal<any[]>([]);
  searchTerm = signal('');
  selectedBranchId = signal('');

  // Hesaplanmış (Filtered) Liste
  filteredDepartments = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const branchId = this.selectedBranchId();
    
    return this.departments().filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(term) || (d.code && d.code.toLowerCase().includes(term));
      const matchesBranch = !branchId || d.branchId === branchId;
      return matchesSearch && matchesBranch;
    });
  });

  ngOnInit(): void {
    this.loadDepartments();
    this.loadBranches();
  }

  loadDepartments(): void {
    this.orgService.getDepartments().subscribe(res => this.departments.set(res));
  }

  loadBranches(): void {
    this.orgService.getBranches().subscribe(res => this.branches.set(res));
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedBranchId.set('');
  }
}
