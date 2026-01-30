import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container mt-4 animate__animated animate__fadeIn">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold text-primary mb-0">
          <i class="bi bi-building-fill me-2"></i>Şirket Yönetimi
        </h2>
        <a routerLink="/companies/create" class="btn btn-primary rounded-pill px-4 shadow-sm">
          <i class="bi bi-plus-lg me-2"></i>Yeni Şirket Ekle
        </a>
      </div>

      <!-- Filtreleme Alanı -->
      <div class="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-light bg-opacity-50">
        <div class="row g-3">
          <div class="col-md-10">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0 border-2">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input type="text" class="form-control border-start-0 border-2" 
                     placeholder="Şirket adı veya vergi numarasına göre ara..."
                     [(ngModel)]="searchTerm">
            </div>
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-secondary w-100 border-2" (click)="searchTerm.set('')">
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
                <th class="ps-4 py-3">Şirket Ünvanı</th>
                <th>Vergi No / Daire</th>
                <th>Adres</th>
                <th class="text-center">Durum</th>
                <th class="text-center pe-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              @for (company of filteredCompanies(); track company.id) {
                <tr class="animate__animated animate__fadeIn">
                  <td class="ps-4">
                    <div class="fw-bold text-dark">{{ company.name }}</div>
                  </td>
                  <td>
                    <div class="small fw-semibold">{{ company.taxNumber }}</div>
                    <div class="small text-muted">{{ company.taxOffice }}</div>
                  </td>
                  <td>
                    <small class="text-muted d-inline-block text-truncate" style="max-width: 250px;">
                      {{ company.address || '-' }}
                    </small>
                  </td>
                  <td class="text-center">
                    <span class="badge rounded-pill" [class.bg-success]="company.isActive" [class.bg-danger]="!company.isActive">
                      {{ company.isActive ? 'Aktif' : 'Pasif' }}
                    </span>
                  </td>
                  <td class="text-center pe-4">
                    <a [routerLink]="['/companies/edit', company.id]" class="btn btn-sm btn-outline-primary rounded-pill px-3">
                      <i class="bi bi-pencil-square me-1"></i>Düzenle
                    </a>
                  </td>
                </tr>
              }
              @if (filteredCompanies().length === 0) {
                <tr>
                  <td colspan="5" class="text-center py-5 text-muted">
                    <div class="display-6 opacity-25 mb-2"><i class="bi bi-search"></i></div>
                    Arama kriterlerine uygun şirket bulunamadı.
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
    .form-control:focus { border-color: #0d6efd; box-shadow: none; }
    .input-group-text { border-color: #dee2e6; }
  `]
})
export class CompanyListComponent implements OnInit {
  private readonly orgService = inject(OrganizationService);
  
  companies = signal<any[]>([]);
  searchTerm = signal('');

  filteredCompanies = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.companies().filter(c => 
      c.name.toLowerCase().includes(term) || 
      (c.taxNumber && c.taxNumber.includes(term))
    );
  });

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.orgService.getCompanies().subscribe(res => this.companies.set(res));
  }
}
