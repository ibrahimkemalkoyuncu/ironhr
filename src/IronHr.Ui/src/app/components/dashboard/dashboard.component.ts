import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';

/**
 * IRONHR - DASHBOARD (YÖNETİCİ PANELİ)
 * Numan Bey için hazırlanan, şirketin genel durumunu özetleyen modern arayüz.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-page p-4 animate__animated animate__fadeIn">
      
      <!-- Üst Karşılama Alanı -->
      <div class="welcome-section mb-5">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="fw-800 text-dark mb-1">Hoş Geldiniz, <span class="text-primary">Numan Bey</span></h1>
            <p class="text-secondary fw-medium opacity-75">Sistemdeki son gelişmeleri ve şirket özetini buradan takip edebilirsiniz.</p>
          </div>
          <div class="col-md-4 text-md-end">
            <div class="glass p-3 rounded-4 d-inline-flex align-items-center shadow-sm border">
               <div class="me-3 p-2 bg-primary bg-opacity-10 rounded-3 text-primary">
                  <i class="bi bi-clock-fill fs-4"></i>
               </div>
               <div class="text-start">
                  <div class="small fw-bold text-muted text-uppercase" style="font-size: 0.65rem;">Sistem Zamanı</div>
                  <div class="fw-bold fs-5">{{ today | date:'dd MMMM yyyy' }}</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <!-- İstatistik Kartları -->
      <div class="row g-4 mb-5">
        <!-- Toplam Personel -->
        <div class="col-md-3">
          <div class="premium-card p-4 rounded-4 shadow-sm bg-gradient-blue text-white h-100 position-relative overflow-hidden">
            <div class="relative-content">
              <div class="opacity-75 small fw-bold text-uppercase mb-1">Toplam Personel</div>
              <div class="display-5 fw-800 mb-2">{{ stats()?.totalEmployees || 0 }}</div>
              <div class="badge bg-white bg-opacity-20 rounded-pill px-3 py-1 small">
                <i class="bi bi-graph-up-arrow me-1"></i> %2 Büyüme
              </div>
            </div>
            <i class="bi bi-people-fill card-icon-bg"></i>
          </div>
        </div>

        <!-- Bugün İzinli -->
        <div class="col-md-3">
          <div class="premium-card p-4 rounded-4 shadow-sm bg-gradient-green text-white h-100 position-relative overflow-hidden">
            <div class="relative-content">
              <div class="opacity-75 small fw-bold text-uppercase mb-1">Bugün İzinli</div>
              <div class="display-5 fw-800 mb-2">{{ stats()?.onLeaveToday || 0 }}</div>
              <a routerLink="/leaves/calendar" class="text-white text-decoration-none small opacity-75 hover-opacity-100">
                Takvimde gör <i class="bi bi-chevron-right small"></i>
              </a>
            </div>
            <i class="bi bi-airplane-fill card-icon-bg"></i>
          </div>
        </div>

        <!-- Bekleyen Talepler -->
        <div class="col-md-3">
          <div class="premium-card p-4 rounded-4 shadow-sm bg-gradient-amber text-white h-100 position-relative overflow-hidden">
            <div class="relative-content">
              <div class="opacity-75 small fw-bold text-uppercase mb-1">Bekleyen Talepler</div>
              <div class="display-5 fw-800 mb-2">{{ stats()?.pendingLeaves || 0 }}</div>
              <a routerLink="/leaves/manage" class="text-white text-decoration-none small opacity-75 hover-opacity-100">
                Onaylamaya git <i class="bi bi-chevron-right small"></i>
              </a>
            </div>
            <i class="bi bi-clock-history card-icon-bg"></i>
          </div>
        </div>

        <!-- Maliyet -->
        <div class="col-md-3">
          <div class="premium-card p-4 rounded-4 shadow-sm bg-gradient-purple text-white h-100 position-relative overflow-hidden">
            <div class="relative-content">
              <div class="opacity-75 small fw-bold text-uppercase mb-1">Aylık Maliyet</div>
              <div class="fs-2 fw-800 mb-2">{{ stats()?.monthlyTotalCost | currency:'TRY':'symbol':'1.0-0' }}</div>
              <div class="small opacity-75">Bordro Tahakkuku</div>
            </div>
            <i class="bi bi-cash-stack card-icon-bg"></i>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Şube Dağılımı -->
        <div class="col-lg-7">
          <div class="card p-4 rounded-4 border-0 shadow-sm h-100 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-bar-chart-fill text-primary me-2"></i>Şube Dağılımı</h5>
              <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill small">Aktif Personeller</span>
            </div>
            <div class="distribution-list mt-2">
              @for (item of stats()?.branchDistribution; track item.name) {
                <div class="branch-item mb-4 animate__animated animate__fadeInLeft" [style.animation-delay]="$index * 100 + 'ms'">
                  <div class="d-flex justify-content-between align-items-end mb-2">
                    <div>
                      <span class="fw-bold text-dark d-block mb-0">{{ item.name }}</span>
                      <span class="text-muted small">Personel Sayısı</span>
                    </div>
                    <div class="text-end">
                      <span class="fw-800 text-primary fs-5 d-block">{{ item.count }}</span>
                      <span class="text-muted small">%{{ ((item.count / stats()!.totalEmployees) * 100) | number:'1.0-0' }}</span>
                    </div>
                  </div>
                  <div class="progress rounded-pill bg-light" style="height: 12px; overflow: visible;">
                    <div class="progress-bar rounded-pill shadow-sm" role="progressbar" 
                         [class.bg-primary]="!$first" [class.bg-info]="$first"
                         [style.width]="((item.count / stats()!.totalEmployees) * 100) + '%'">
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Gelecek Etkinlikler -->
        <div class="col-lg-5">
          <div class="card p-4 rounded-4 border-0 shadow-sm h-100">
            <h5 class="fw-bold mb-4 text-dark"><i class="bi bi-stars text-info me-2"></i>Yaklaşan Etkinlikler</h5>
            <div class="event-timeline pe-2" style="max-height: 500px; overflow-y: auto;">
              @for (event of stats()?.upcomingEvents; track $index) {
                <div class="event-card d-flex align-items-center p-3 mb-3 rounded-4 border bg-white hover-shadow transition">
                  <div class="event-date-box me-3 text-center rounded-3 p-2" [class.bg-birth]="event.type === 'Doğum Günü'" [class.bg-hire]="event.type !== 'Doğum Günü'">
                    <div class="small text-uppercase fw-bold opacity-75">{{ event.date | date:'MMM' }}</div>
                    <div class="fs-4 fw-800 day-num">{{ event.date | date:'dd' }}</div>
                  </div>
                  <div class="flex-grow-1">
                    <div class="fw-bold text-dark">{{ event.employeeName }}</div>
                    <div class="small d-flex align-items-center gap-2">
                       @if (event.type === 'Doğum Günü') {
                         <span class="text-danger"><i class="bi bi-cake2-fill me-1"></i>Doğum Günü</span>
                       } @else {
                         <span class="text-success"><i class="bi bi-briefcase-fill me-1"></i>İşe Giriş Yıl Dönümü</span>
                       }
                    </div>
                  </div>
                  <div class="countdown-badge text-end ms-2">
                     <span class="badge rounded-pill" [class.bg-danger]="event.dayCount < 7" [class.bg-light]="event.dayCount >= 7" [class.text-dark]="event.dayCount >= 7">
                        {{ event.dayCount === 0 ? 'Bugün!' : event.dayCount + ' gün' }}
                     </span>
                  </div>
                </div>
              }
              @if (stats()?.upcomingEvents?.length === 0) {
                <div class="text-center py-5">
                   <i class="bi bi-calendar-x fs-1 text-muted opacity-25"></i>
                   <p class="text-muted mt-3">Önümüzdeki 30 gün içinde etkinlik yok.</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-page { min-height: calc(100vh - 80px); }
    .fw-800 { font-weight: 800; }
    
    .premium-card { transition: all 0.3s ease; border: none; cursor: default; }
    .premium-card:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1) !important; }
    
    .bg-gradient-blue { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
    .bg-gradient-green { background: linear-gradient(135deg, #10b981 0%, #047857 100%); }
    .bg-gradient-amber { background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%); }
    .bg-gradient-purple { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); }
    
    .card-icon-bg { position: absolute; right: -15px; bottom: -15px; font-size: 8rem; opacity: 0.15; transform: rotate(-15deg); }
    .relative-content { position: relative; z-index: 1; }
    
    .hover-opacity-100:hover { opacity: 1 !important; transform: translateX(5px); }
    .transition { transition: all 0.2s ease; }
    
    .branch-item .progress-bar { transition: width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
    
    .event-card { border: 1px solid #f1f5f9; }
    .event-card:hover { background: #f8fafc; border-color: #cbd5e1; transform: scale(1.01); }
    
    .event-date-box { min-width: 60px; color: white; display: flex; flex-direction: column; justify-content: center; }
    .bg-birth { background: linear-gradient(180deg, #f87171 0%, #dc2626 100%); }
    .bg-hire { background: linear-gradient(180deg, #34d399 0%, #059669 100%); }
    
    .day-num { line-height: 1; }
    .hover-shadow:hover { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    
    .event-timeline::-webkit-scrollbar { width: 4px; }
    .event-timeline::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  
  stats = signal<any>(null);
  today = new Date();

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe(res => {
      this.stats.set(res);
    });
  }
}
