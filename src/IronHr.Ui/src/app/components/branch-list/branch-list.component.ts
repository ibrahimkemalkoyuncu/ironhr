import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mt-4 animate__animated animate__fadeIn">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold text-primary mb-0">
          <i class="bi bi-geo-alt-fill me-2"></i>Şube Yönetimi
        </h2>
        <a routerLink="/branches/create" class="btn btn-primary rounded-pill px-4 shadow-sm">
          <i class="bi bi-plus-lg me-2"></i>Yeni Şube Ekle
        </a>
      </div>

      <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4">Şube Adı</th>
                <th>Kod</th>
                <th>Bağlı Şirket</th>
                <th>Adres</th>
                <th class="text-center">Durum</th>
                <th class="text-center pe-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              @for (branch of branches(); track branch.id) {
                <tr>
                  <td class="ps-4 fw-bold text-dark">{{ branch.name }}</td>
                  <td><span class="badge bg-light text-dark border">{{ branch.code }}</span></td>
                  <td>{{ branch.companyName }}</td>
                  <td>
                    <small class="text-muted d-inline-block text-truncate" style="max-width: 200px;">
                      {{ branch.address || '-' }}
                    </small>
                  </td>
                  <td class="text-center">
                    <span class="badge rounded-pill" [class.bg-success]="branch.isActive" [class.bg-danger]="!branch.isActive">
                      {{ branch.isActive ? 'Aktif' : 'Pasif' }}
                    </span>
                  </td>
                  <td class="text-center pe-4">
                    <a [routerLink]="['/branches/edit', branch.id]" class="btn btn-sm btn-outline-primary rounded-pill">
                      <i class="bi bi-pencil-square me-1"></i>Düzenle
                    </a>
                  </td>
                </tr>
              }
              @if (branches().length === 0) {
                <tr>
                  <td colspan="6" class="text-center py-5 text-muted">
                    Henüz kayıtlı şube bulunamadı.
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
    .table thead th { font-weight: 600; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.5px; }
  `]
})
export class BranchListComponent implements OnInit {
  private readonly orgService = inject(OrganizationService);
  branches = signal<any[]>([]);

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.orgService.getBranches().subscribe(res => this.branches.set(res));
  }
}
