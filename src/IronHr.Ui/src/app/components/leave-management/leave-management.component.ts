import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveService } from '../../services/leave.service';

/**
 * IRONHR - İZİN YÖNETİM PANELİ (LEAVE MANAGEMENT COMPONENT)
 * Yöneticilerin bekleyen izin taleplerini onayladığı veya reddettiği merkez.
 */
@Component({
  selector: 'app-leave-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold text-dark">
            <i class="bi bi-shield-check text-success me-2"></i>İzin Onay Merkezi
          </h2>
          <p class="text-muted">Onay bekleyen toplam {{ pendingLeaves().length }} talep var.</p>
        </div>
      </div>

      <!-- Bekleyen Talepler Listesi -->
      <div class="row g-4">
        @for (leave of pendingLeaves(); track leave.id) {
          <div class="col-md-6 col-lg-4 animate__animated animate__fadeInUp">
            <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
              <div class="card-header bg-white border-0 pt-4 px-4 pb-0">
                 <div class="d-flex align-items-center">
                    <div class="avatar-sm bg-primary bg-opacity-10 text-primary rounded-circle me-3 d-flex align-items-center justify-content-center fw-bold">
                       {{ leave.firstName[0] }}{{ leave.lastName[0] }}
                    </div>
                    <div>
                       <h6 class="mb-0 fw-bold">{{ leave.firstName }} {{ leave.lastName }}</h6>
                       <small class="text-muted">{{ leave.leaveTypeName }}</small>
                    </div>
                 </div>
              </div>
              <div class="card-body px-4 pt-3">
                <div class="bg-light rounded-3 p-3 mb-3">
                   <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted small">Tarih Aralığı:</span>
                      <span class="fw-semibold small">{{ leave.startDate | date:'dd.MM.yyyy' }} - {{ leave.endDate | date:'dd.MM.yyyy' }}</span>
                   </div>
                   <div class="d-flex justify-content-between">
                      <span class="text-muted small">Net Süre:</span>
                      <span class="badge bg-dark text-white">{{ leave.durationDays }} GÜN</span>
                   </div>
                </div>
                <p class="small text-muted mb-0 italic" *ngIf="leave.description">
                   "{{ leave.description }}"
                </p>
              </div>
              <div class="card-footer bg-white border-0 p-4 pt-0">
                <div class="row g-2">
                   <div class="col-6">
                      <button class="btn btn-outline-danger w-100 py-2 rounded-3" (click)="handleStatus(leave.id, 2)">
                         <i class="bi bi-x-circle me-1"></i> Reddet
                      </button>
                   </div>
                   <div class="col-6">
                      <button class="btn btn-success w-100 py-2 rounded-3" (click)="handleStatus(leave.id, 1)">
                         <i class="bi bi-check-circle me-1"></i> Onayla
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        }

        @if (pendingLeaves().length === 0) {
          <div class="col-12 text-center py-5">
             <div class="display-1 text-muted opacity-25 mb-3"><i class="bi bi-check-all"></i></div>
             <h4 class="text-muted">Onay bekleyen izin talebi bulunmuyor.</h4>
             <p class="text-muted">Harika! Tüm işleri temizlediniz.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .avatar-sm { width: 45px; height: 45px; }
    .card { transition: transform 0.2s ease, box-shadow 0.2s ease; border-bottom: 4px solid #198754 !important; }
    .card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
    .italic { font-style: italic; }
  `]
})
export class LeaveManagementComponent implements OnInit {
  private readonly leaveService = inject(LeaveService);
  
  pendingLeaves = signal<any[]>([]);

  ngOnInit(): void {
    this.loadPendingLeaves();
  }

  loadPendingLeaves(): void {
    this.leaveService.getPendingLeaves().subscribe(res => this.pendingLeaves.set(res));
  }

  handleStatus(requestId: string, status: number): void {
    this.leaveService.processLeave(requestId, status).subscribe({
      next: () => {
        this.loadPendingLeaves(); // Listeyi tazele
      },
      error: (err) => alert(err.error?.error?.message || 'İşlem sırasında bir hata oluştu.')
    });
  }
}
