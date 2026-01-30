import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';

/**
 * IRONHR - PERSONEL LİSTELEME EKRANI (PERSONNEL LIST COMPONENT)
 * Tüm aktif personellerin listelendiği, filtreleme ve arama özellikli modern tablo.
 */
@Component({
  selector: 'app-personnel-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid mt-4 mb-5 px-lg-5 animate__animated animate__fadeIn">
      <!-- Header Bölümü -->
      <div class="glass-card p-4 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 shadow-sm border-0 rounded-4">
        <div>
          <h2 class="fw-800 text-gradient-primary mb-1 d-flex align-items-center">
            <i class="bi bi-people-fill me-3"></i>Personel Yönetimi
          </h2>
          <p class="text-muted mb-0 fw-medium opacity-75">
            Toplam <span class="text-primary fw-bold">{{ employees().length }}</span> aktif çalışan operasyonunuzda yer alıyor.
          </p>
        </div>
        <a routerLink="/employees/create" class="btn btn-primary btn-lg shadow d-flex align-items-center rounded-pill px-4">
          <i class="bi bi-person-plus-fill me-2 fs-5"></i>
          <span>Yeni Personel Ekle</span>
        </a>
      </div>

      <!-- Filtreleme ve Arama Çubuğu -->
      <div class="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div class="card-body p-1 bg-white">
          <div class="row g-0 align-items-center">
            <div class="col-md-9 border-end">
              <div class="input-group input-group-lg border-0">
                <span class="input-group-text bg-transparent border-0 ps-4">
                  <i class="bi bi-search text-primary"></i>
                </span>
                <input type="text" class="form-control border-0 shadow-none fs-6 py-3 fw-medium" 
                       placeholder="İsim, T.C. No veya Sicil No ile hızlıca ara..." (input)="onSearch($event)">
              </div>
            </div>
            <div class="col-md-3 bg-light p-3 d-flex justify-content-center align-items-center">
              <span class="small fw-bold text-muted text-uppercase tracking-wider">
                <i class="bi bi-funnel-fill me-2"></i>Hızlı Filtre
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Personel Tablosu -->
      <div class="card border-0 shadow-lg rounded-4 overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-premium-table">
            <thead>
              <tr class="bg-primary bg-opacity-10 text-primary">
                <th class="ps-4 py-3">Personel Künyesi</th>
                <th class="py-3">Kimlik & Sicil</th>
                <th class="py-3">Organizasyonel Birim</th>
                <th class="py-3">İşe Giriş</th>
                <th class="text-center py-3">Durum</th>
                <th class="text-center pe-4 py-3" style="width: 120px;">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              @for (emp of filteredEmployees(); track emp.id) {
                <tr class="animate__animated animate__fadeInUp" [style.animation-delay]="$index * 30 + 'ms'">
                  <td class="ps-4">
                    <div class="d-flex align-items-center py-1">
                      <div class="avatar-premium me-3" [style.background-image]="'linear-gradient(135deg, #0d6efd, #004aad)'">
                         {{ emp.firstName[0] }}{{ emp.lastName[0] }}
                      </div>
                      <div>
                        <div class="fw-bold text-dark fs-6">{{ emp.firstName }} {{ emp.lastName }}</div>
                        <div class="small text-muted font-monospace opacity-75">{{ emp.id.substring(0,8).toUpperCase() }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex flex-column">
                      <span class="fw-medium text-dark">{{ emp.identityNumber }}</span>
                      <span class="badge bg-light text-secondary border border-secondary-subtle align-self-start mt-1" style="font-size: 0.65rem;">
                        SICIL: {{ emp.registrationNumber }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="fw-bold text-primary">{{ emp.branchName }}</div>
                    <div class="small fw-medium text-secondary opacity-75">{{ emp.departmentName }}</div>
                  </td>
                  <td>
                    <div class="fw-medium">{{ emp.hireDate | date:'dd MMM yyyy' }}</div>
                    <div class="small text-muted">{{ calculateYears(emp.hireDate) | number:'1.1-1' }} Yıl</div>
                  </td>
                  <td class="text-center">
                    <span class="status-pill" [class.active]="emp.isActive" [class.inactive]="!emp.isActive">
                      <span class="dot"></span>
                      {{ emp.isActive ? 'Aktif' : 'Pasif' }}
                    </span>
                  </td>
                  <td class="text-center pe-4">
                    <div class="d-flex gap-2 justify-content-center">
                      <a [routerLink]="['/employees', emp.id]" class="action-btn btn-info-soft" title="Görüntüle">
                        <i class="bi bi-eye-fill"></i>
                      </a>
                      <a [routerLink]="['/employees/edit', emp.id]" class="action-btn btn-primary-soft" title="Düzenle">
                        <i class="bi bi-pencil-fill"></i>
                      </a>
                    </div>
                  </td>
                </tr>
              }
              @if (filteredEmployees().length === 0) {
                <tr>
                   <td colspan="6" class="text-center py-5">
                      <div class="empty-state">
                        <i class="bi bi-search text-muted opacity-25" style="font-size: 5rem;"></i>
                        <h4 class="text-muted mt-3">Maalesef bir sonuç bulamadık.</h4>
                        <p class="text-secondary opacity-75">Farklı bir arama terimi deneyebilirsiniz.</p>
                      </div>
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
    .fw-800 { font-weight: 800; }
    .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.3); }
    .tracking-wider { letter-spacing: 1px; }

    .custom-premium-table thead th { border: none; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
    .custom-premium-table tbody tr { transition: all 0.2s; border-bottom: 1px solid #f1f5f9; }
    .custom-premium-table tbody tr:hover { background-color: #fbfcfe; transform: scale(1.002); }
    
    .avatar-premium { 
      width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; 
      justify-content: center; color: white; font-weight: 800; font-size: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }

    .status-pill { 
      display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; 
      font-size: 0.75rem; font-weight: 700; border: 1px solid transparent; 
    }
    .status-pill.active { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
    .status-pill.inactive { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
    .status-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

    .action-btn { 
      width: 34px; height: 34px; border-radius: 10px; display: flex; 
      align-items: center; justify-content: center; text-decoration: none; 
      transition: all 0.2s; border: none; font-size: 0.9rem;
    }
    .btn-info-soft { background: #e0f2fe; color: #0369a1; }
    .btn-info-soft:hover { background: #0369a1; color: white; transform: translateY(-3px); }
    .btn-primary-soft { background: #eef2ff; color: #4338ca; }
    .btn-primary-soft:hover { background: #4338ca; color: white; transform: translateY(-3px); }

    .empty-state { padding: 4rem 1rem; }
    .animate__fadeInUp { animation-duration: 0.6s; }
  `]
})
export class PersonnelListComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);

  employees = signal<any[]>([]);
  filteredEmployees = signal<any[]>([]);
  searchTerm = signal('');
  today = new Date();

  calculateYears(hireDate: string): number {
    const start = new Date(hireDate);
    const diff = Math.abs(this.today.getTime() - start.getTime());
    return diff / (1000 * 60 * 60 * 24 * 365.25);
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe(res => {
      this.employees.set(res);
      this.filteredEmployees.set(res);
    });
  }

  onSearch(event: any): void {
    const term = event.target.value.toLowerCase();
    this.searchTerm.set(term);
    
    if (!term) {
      this.filteredEmployees.set(this.employees());
      return;
    }

    const filtered = this.employees().filter(e => 
      e.firstName.toLowerCase().includes(term) ||
      e.lastName.toLowerCase().includes(term) ||
      e.identityNumber.includes(term) ||
      e.registrationNumber.toLowerCase().includes(term)
    );
    this.filteredEmployees.set(filtered);
  }
}
