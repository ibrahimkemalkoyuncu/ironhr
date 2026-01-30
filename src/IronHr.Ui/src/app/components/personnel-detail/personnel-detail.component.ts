import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { DocumentService } from '../../services/document.service';
import { LeaveService } from '../../services/leave.service';
import { PayrollService } from '../../services/payroll.service';
import { PerformanceService } from '../../services/performance.service';

/**
 * IRONHR - PERSONEL DETAY EKRANI (PERSONNEL DETAIL COMPONENT)
 */
@Component({
  selector: 'app-personnel-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container-fluid py-4 mb-5 px-lg-5 animate__animated animate__fadeIn">
      @if (loading()) {
        <div class="d-flex flex-column justify-content-center align-items-center py-5 min-vh-50">
          <div class="spinner-grow text-primary mb-3" role="status"></div>
          <div class="text-muted fw-bold">Veriler Getiriliyor...</div>
        </div>
      } @else if (employee(); as emp) {
        <!-- Üst Profil Başlığı -->
        <div class="glass-card p-4 mb-4 shadow-lg border-0 rounded-4 overflow-hidden position-relative">
          <div class="bg-decoration"></div>
          <div class="d-flex flex-column flex-md-row align-items-center position-relative">
            <div class="avatar-premium-lg me-md-4 mb-3 mb-md-0 shadow-lg animate__animated animate__bounceIn">
              {{ emp.firstName[0] }}{{ emp.lastName[0] }}
            </div>
            <div class="text-center text-md-start">
              <h1 class="display-5 fw-800 text-dark mb-1">{{ emp.firstName }} {{ emp.lastName }}</h1>
              <div class="d-flex flex-wrap justify-content-center justify-content-md-start align-items-center gap-3">
                <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold">
                  <i class="bi bi-briefcase-fill me-2"></i>{{ emp.departmentName }}
                </span>
                <span class="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2 rounded-pill fw-bold">
                  <i class="bi bi-geo-alt-fill me-2"></i>{{ emp.branchName }}
                </span>
              </div>
            </div>
            <div class="ms-md-auto mt-4 mt-md-0 text-center text-md-end">
               <div class="status-indicator-big mb-3" [class.active]="emp.isActive">
                  <span class="dot"></span> {{ emp.isActive ? 'AKTİF PERSONEL' : 'PASİF' }}
               </div>
               <div class="d-flex gap-2 justify-content-center justify-content-md-end">
                 <a [routerLink]="['/employees/edit', emp.id]" class="btn btn-outline-primary rounded-pill px-4 fw-bold">
                    <i class="bi bi-pencil-square me-2"></i>Düzenle
                 </a>
                 <button class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
                    <i class="bi bi-person-check-fill me-2"></i>İşlemler
                 </button>
               </div>
            </div>
          </div>
        </div>

        <div class="row g-4 invisible-scroll">
          <!-- Sol Kolon: Detaylar ve Geçmiş -->
          <div class="col-lg-8 animate__animated animate__fadeInLeft">
            
            <!-- Bilgi Blokları ızgarası -->
            <div class="row g-3 mb-4">
              <div class="col-md-6 col-xl-4">
                <div class="card info-mini-card p-3 h-100">
                  <label class="info-label text-truncate">TC KİMLİK NO</label>
                  <div class="info-value">{{ emp.identityNumber }}</div>
                </div>
              </div>
              <div class="col-md-6 col-xl-4">
                <div class="card info-mini-card p-3 h-100">
                  <label class="info-label text-truncate">SİCİL NUMARASI</label>
                  <div class="info-value font-monospace">{{ emp.registrationNumber }}</div>
                </div>
              </div>
              <div class="col-md-6 col-xl-4">
                <div class="card info-mini-card p-3 h-100 border-primary-subtle border-start-4">
                  <label class="info-label text-truncate text-primary">İŞE GİRİŞ</label>
                  <div class="info-value text-primary">{{ emp.hireDate | date:'dd MMM yyyy' }}</div>
                </div>
              </div>
            </div>

            <!-- Tabs veya Sticky Menü gibi Bölümler -->
            <div class="sections-container d-grid gap-4">
              
              <!-- Performans Bölümü -->
              <section class="premium-section card border-0 p-4 shadow-sm">
                 <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                    <h5 class="fw-800 text-info d-flex align-items-center mb-0">
                      <i class="bi bi-star-fill me-2 fs-5"></i>Performans Değerlendirmeleri
                    </h5>
                    <button class="btn btn-info btn-sm text-white rounded-pill px-3 fw-bold" (click)="showEvalForm.set(!showEvalForm())">
                      <i class="bi" [class.bi-plus-lg]="!showEvalForm()" [class.bi-dash-lg]="showEvalForm()"></i>
                      {{ showEvalForm() ? 'Vazgeç' : 'Yeni Değerlendirme' }}
                    </button>
                 </div>

                 @if (showEvalForm()) {
                   <div class="bg-light p-4 rounded-4 mb-4 shadow-inner border animate__animated animate__fadeIn">
                     <div class="row g-3">
                       <div class="col-md-4">
                          <label class="small fw-bold text-muted mb-1">Değerlendirme Dönemi</label>
                          <input type="text" class="form-control" [(ngModel)]="evalModel.periodTitle" placeholder="Örn: 2025 Yıl Sonu">
                       </div>
                       <div class="col-md-3">
                          <label class="small fw-bold text-muted mb-1">Performans Puanı (1-5)</label>
                          <input type="number" class="form-control text-center fw-bold text-primary" [(ngModel)]="evalModel.score" min="1" max="5">
                       </div>
                       <div class="col-md-5">
                          <label class="small fw-bold text-muted mb-1">Geri Bildirim / Notlar</label>
                          <textarea class="form-control" [(ngModel)]="evalModel.reviewNotes" rows="1"></textarea>
                       </div>
                       <div class="col-12 text-end">
                          <button class="btn btn-primary px-5 rounded-pill shadow-sm" [disabled]="!evalModel.periodTitle || evalModel.score < 1 || savingEval()" (click)="saveEvaluation()">
                            <span *ngIf="savingEval()" class="spinner-border spinner-border-sm me-2"></span>
                            {{ savingEval() ? 'Kaydediliyor...' : 'Değerlendirmeyi Tamamla' }}
                          </button>
                       </div>
                     </div>
                   </div>
                 }

                 <div class="eval-grid row g-3">
                    @for (ev of evaluations(); track ev.id) {
                      <div class="col-md-6">
                        <div class="eval-card p-3 rounded-4 border shadow-sm transition h-100" [class.border-success-subtle]="ev.score >= 4" [class.border-warning-subtle]="ev.score < 4 && ev.score >= 3" [class.border-danger-subtle]="ev.score < 3">
                           <div class="d-flex justify-content-between align-items-start mb-3">
                              <span class="fw-bold text-dark fs-5">{{ ev.periodTitle }}</span>
                              <div class="score-badge" [class.excellent]="ev.score >= 4" [class.average]="ev.score < 4 && ev.score >= 3" [class.low]="ev.score < 3">
                                {{ ev.score }}
                              </div>
                           </div>
                           <p class="text-secondary small fst-italic mb-3">{{ ev.reviewNotes || 'Not girilmedi.' }}</p>
                           <div class="d-flex justify-content-between align-items-center mt-auto pt-2 border-top border-light">
                              <span class="text-muted small"><i class="bi bi-calendar-event me-1"></i>{{ ev.evaluationDate | date:'dd MMM yyyy' }}</span>
                              <span class="text-muted small fw-bold"><i class="bi bi-person-check me-1"></i>{{ ev.evaluatorName || 'Sistem' }}</span>
                           </div>
                        </div>
                      </div>
                    }
                    @if (evaluations().length === 0) {
                      <div class="col-12 text-center py-4 opacity-50 fst-italic">Henüz bir performans kaydı girilmemiş.</div>
                    }
                 </div>
              </section>

              <!-- Bordrolar Bölümü -->
              <section class="premium-section card border-0 p-4 shadow-sm">
                 <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                    <h5 class="fw-800 text-primary mb-0 d-flex align-items-center">
                      <i class="bi bi-cash-coin me-2 fs-5"></i>Mali Kayıtlar & Bordrolar
                    </h5>
                    <button class="btn btn-outline-primary btn-sm rounded-pill px-4 fw-bold shadow-sm" (click)="calculateCurrentMonth()" [disabled]="calculating() || !emp.baseSalary">
                      <span *ngIf="calculating()" class="spinner-border spinner-border-sm me-2"></span>
                      <i *ngIf="!calculating()" class="bi bi-lightning-charge-fill me-1"></i>
                      Bordro Oluştur ({{ today | date:'MMMM' }})
                    </button>
                 </div>

                 <div class="table-responsive rounded-4 overflow-hidden border">
                    <table class="table table-hover align-middle mb-0 premium-table-sm">
                      <thead class="bg-light">
                        <tr>
                          <th class="ps-4">Dönem</th>
                          <th>Brüt Hakediş</th>
                          <th>Net Ödeme</th>
                          <th>Toplam Maliyet</th>
                          <th class="text-center pe-4">Pusula</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (p of payrolls(); track p.id) {
                          <tr>
                            <td class="ps-4"><span class="fw-800 text-dark">{{ p.month }}/{{ p.year }}</span></td>
                            <td>{{ p.grossSalary | currency:'TRY':'symbol':'1.0-0' }}</td>
                            <td class="text-success fw-bold">{{ p.netSalary | currency:'TRY':'symbol':'1.0-0' }}</td>
                            <td class="text-muted small">{{ p.totalEmployerCost | currency:'TRY':'symbol':'1.0-0' }}</td>
                            <td class="text-center pe-4 text-primary fs-5">
                              <i class="bi bi-file-earmark-pdf-fill cursor-pointer hover-scale"></i>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                 </div>
              </section>

              <!-- Dökümanlar Bölümü -->
              <section class="premium-section card border-0 p-4 shadow-sm">
                 <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                    <h5 class="fw-800 text-primary mb-0 d-flex align-items-center">
                      <i class="bi bi-folder-fill me-2 fs-5"></i>Dijital Özlük Dosyası
                    </h5>
                    <button class="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm" (click)="toggleUpload()">
                      <i class="bi" [class.bi-file-earmark-arrow-up-fill]="!showUpload()" [class.bi-x-lg]="showUpload()"></i>
                      {{ showUpload() ? 'Vazgeç' : 'Döküman Yükle' }}
                    </button>
                 </div>

                 @if (showUpload()) {
                   <div class="bg-light p-4 rounded-4 mb-4 shadow-inner border border-dashed animate__animated animate__fadeIn">
                     <div class="row g-3">
                       <div class="col-md-5">
                         <label class="small fw-bold text-muted mb-1">Dosya Seçin (PDF/Resim)</label>
                         <input type="file" class="form-control" (change)="onFileSelected($event)">
                       </div>
                       <div class="col-md-5">
                         <label class="small fw-bold text-muted mb-1">Döküman Adı / Açıklama</label>
                         <input type="text" class="form-control" placeholder="Örn: Diploma, İkametgah..." #docDesc>
                       </div>
                       <div class="col-md-2 d-flex align-items-end">
                         <button class="btn btn-primary w-100 fw-bold" [disabled]="!selectedFile() || uploading()" (click)="uploadDoc(docDesc.value)">
                           <span *ngIf="uploading()" class="spinner-border spinner-border-sm me-2"></span>
                           {{ uploading() ? '...' : 'Yükle' }}
                         </button>
                       </div>
                     </div>
                   </div>
                 }

                 <div class="row g-3">
                   @for (doc of documents(); track doc.id) {
                     <div class="col-md-6">
                       <div class="doc-item-card p-3 rounded-4 border d-flex align-items-center transition">
                         <div class="doc-icon me-3 bg-light text-primary rounded-3">
                           <i class="bi bi-file-earmark-richtext-fill fs-3"></i>
                         </div>
                         <div class="flex-grow-1 overflow-hidden">
                           <div class="fw-bold text-dark text-truncate">{{ doc.fileName }}</div>
                           <div class="small text-muted text-truncate">{{ doc.description || 'Açıklama yok' }}</div>
                         </div>
                         <a [href]="getDownloadUrl(doc.id)" target="_blank" class="download-link ms-3 shadow-sm rounded-circle">
                           <i class="bi bi-download"></i>
                         </a>
                       </div>
                     </div>
                   }
                   @if (documents().length === 0) {
                     <div class="col-12 text-center py-4 opacity-50 fst-italic">Henüz dijital döküman eklenmemiş.</div>
                   }
                 </div>
              </section>

              <!-- İzin Geçmişi Tablosu -->
              <section class="premium-section card border-0 p-4 shadow-sm mb-5">
                 <h5 class="fw-800 text-success mb-4 pb-2 border-bottom d-flex align-items-center">
                   <i class="bi bi-calendar-check-fill me-2 fs-5"></i>İzin Hareketleri
                 </h5>
                 <div class="table-responsive rounded-4 overflow-hidden border">
                   <table class="table table-hover align-middle mb-0 premium-table-sm">
                     <thead class="bg-light">
                       <tr>
                         <th class="ps-4">İzin Türü</th>
                         <th>Tarih Aralığı</th>
                         <th>Süre</th>
                         <th class="text-center pe-4">Onay Durumu</th>
                       </tr>
                     </thead>
                     <tbody>
                       @for (leave of leaves(); track leave.id) {
                         <tr class="animate__animated animate__fadeIn">
                           <td class="ps-4">
                             <div class="fw-bold text-dark">{{ leave.leaveTypeName }}</div>
                             <div class="small text-muted">{{ leave.description }}</div>
                           </td>
                           <td class="small fw-medium">
                              {{ leave.startDate | date:'dd MMM yy' }} - {{ leave.endDate | date:'dd MMM yy' }}
                           </td>
                           <td><span class="badge bg-light text-dark fw-bold border">{{ leave.durationDays }} Gün</span></td>
                           <td class="text-center pe-4">
                              @if (leave.status === 0) {
                                <span class="status-pill pending"><span class="dot"></span>Onay Bekliyor</span>
                              } @else if (leave.status === 1) {
                                <span class="status-pill active"><span class="dot"></span>Onaylandı</span>
                              } @else {
                                <span class="status-pill inactive"><span class="dot"></span>Reddedildi</span>
                              }
                           </td>
                         </tr>
                       }
                     </tbody>
                   </table>
                 </div>
              </section>
            </div>
          </div>

          <!-- Sağ Kolon: Özet & Aksiyonlar -->
          <div class="col-lg-4 animate__animated animate__fadeInRight">
            <div class="sticky-sidebar">
               <!-- İzin Bakiyesi Özet -->
               <div class="card border-0 rounded-4 shadow-lg p-4 mb-4 text-white overflow-hidden position-relative" style="background: linear-gradient(135deg, #10b981 0%, #047857 100%)">
                  <div class="card-glow"></div>
                  <h5 class="mb-4 d-flex align-items-center position-relative">
                    <i class="bi bi-calendar2-heart-fill me-2"></i>Kalan İzin Hakları
                  </h5>
                  <div class="d-flex align-items-end mb-3 position-relative">
                     <div class="display-3 fw-800 line-height-1">{{ leaveBalance()?.remainingDays || 0 }}</div>
                     <div class="ms-2 fs-4 mb-1 border-bottom border-white border-2 opacity-75">GÜN</div>
                  </div>
                  <div class="progress bg-white bg-opacity-20 rounded-pill mb-3 position-relative" style="height: 10px;">
                    <div class="progress-bar bg-white opacity-75 rounded-pill" [style.width]="'65%'"></div>
                  </div>
                  <div class="small opacity-75 position-relative">
                     <i class="bi bi-info-circle me-1"></i> Yıllık Hakediş: 14 Gün + 3 Gün Devreden
                  </div>
               </div>

               <!-- Hızlı Aksiyonlar -->
               <div class="card border-0 rounded-4 shadow-sm p-4 mb-4">
                 <h6 class="fw-800 text-muted text-uppercase mb-4 tracking-wider" style="font-size: 0.75rem;">Yönetim Paneli</h6>
                 <div class="d-grid gap-3">
                   <a [routerLink]="['/leaves/request', emp.id]" class="btn btn-light text-start p-3 rounded-4 transition hover-scale d-flex align-items-center">
                     <div class="bg-primary bg-opacity-10 text-primary rounded-3 p-2 me-3">
                        <i class="bi bi-airplane-engines-fill fs-5"></i>
                     </div>
                     <span class="fw-bold">İzin Talebi Oluştur</span>
                   </a>
                   <a class="btn btn-light text-start p-3 rounded-4 transition hover-scale d-flex align-items-center">
                     <div class="bg-info bg-opacity-10 text-info rounded-3 p-2 me-3">
                        <i class="bi bi-calculator-fill fs-5"></i>
                     </div>
                     <span class="fw-bold">Maaş Avansı / Ek Ödeme</span>
                   </a>
                   <a class="btn btn-light text-start p-3 rounded-4 transition hover-scale d-flex align-items-center">
                     <div class="bg-success bg-opacity-10 text-success rounded-3 p-2 me-3">
                        <i class="bi bi-envelope-paper-fill fs-5"></i>
                     </div>
                     <span class="fw-bold">Bordro Gönder (E-Posta)</span>
                   </a>
                   <hr class="my-2 border-dashed">
                   <button class="btn btn-outline-danger border-0 text-start p-3 rounded-4 transition hover-bg-danger d-flex align-items-center">
                     <div class="bg-danger bg-opacity-10 text-danger rounded-3 p-2 me-3 icon-danger">
                        <i class="bi bi-person-dash-fill fs-5"></i>
                     </div>
                     <span class="fw-bold">Personel İlişkisini Kes</span>
                   </button>
                 </div>
               </div>

               <!-- Kıdem ve İstatistik -->
               <div class="card border-0 rounded-4 shadow-sm p-4 bg-light bg-opacity-50">
                  <h6 class="fw-800 text-muted text-uppercase mb-4 tracking-wider" style="font-size: 0.75rem;">Kıdem & Tazminat Öngörüsü</h6>
                  <div class="d-flex align-items-center mb-4">
                     <div class="seniority-ring me-3">
                        <div class="display-6 fw-800 text-primary">{{ calculateSeniority(emp.hireDate) }}</div>
                        <div class="small text-muted line-height-1">GÜN</div>
                     </div>
                     <div>
                        <div class="fw-bold text-dark">Kıdem Süresi</div>
                        <div class="text-secondary small">Şirket Bünyesinde</div>
                     </div>
                  </div>
                  @if (emp.baseSalary) {
                    <div class="p-3 bg-white rounded-4 shadow-sm border border-success-subtle">
                      <div class="text-muted small fw-bold text-uppercase mb-1" style="font-size: 0.65rem;">Net Kıdem Tazminatı (Tahmini)</div>
                      <div class="h4 mb-0 text-success fw-bold">{{ calculateSeverancePay(emp.hireDate, emp.baseSalary) | currency:'TRY':'symbol':'1.0-0' }}</div>
                      <small class="text-muted opacity-50" style="font-size: 0.6rem;">*Yasal tavan ücretlerle çarpılmalıdır.</small>
                    </div>
                  }
               </div>

               <div class="mt-4 px-2">
                 <a routerLink="/employees" class="btn btn-link text-decoration-none text-secondary p-0 fw-bold">
                   <i class="bi bi-arrow-left me-2"></i>Personel Listesine Dön
                 </a>
               </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .fw-800 { font-weight: 800; }
    .display-5 { font-size: 2.5rem; letter-spacing: -1.5px; }
    .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(14px); border: 1px solid rgba(255, 255, 255, 0.4); }
    .bg-decoration { position: absolute; top: -50px; right: -50px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(13, 110, 253, 0.08) 0%, transparent 70%); z-index: 0; }
    
    .avatar-premium-lg { width: 120px; height: 120px; border-radius: 30px; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: 800; color: white; background: linear-gradient(135deg, #0d6efd, #004aad); border: 6px solid white; box-shadow: 0 12px 20px -8px rgba(13, 110, 253, 0.4); z-index: 1; }
    
    .status-indicator-big { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 20px; background: #feefef; color: #dc2626; font-weight: 800; font-size: 0.7rem; border: 1px solid #fecaca; }
    .status-indicator-big.active { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
    .status-indicator-big .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
    
    .info-mini-card { border: 1px solid #f1f5f9; background: #f8fafc; transition: all 0.3s; }
    .info-mini-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -10px rgba(0,0,0,0.1); border-color: #cbd5e1; }
    .info-label { font-size: 0.6rem; font-weight: 800; color: #94a3b8; margin-bottom: 2px; }
    .info-value { font-weight: 700; color: #1e293b; }
    
    .score-badge { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.25rem; color: white; }
    .score-badge.excellent { background: linear-gradient(135deg, #10b981, #059669); }
    .score-badge.average { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .score-badge.low { background: linear-gradient(135deg, #ef4444, #dc2626); }
    
    .eval-card:hover { transform: translateY(-5px); border-color: #0d6efd !important; }
    .premium-table-sm thead th { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; border: none; }
    .premium-table-sm tbody tr:hover { background: #f8fbff; }

    .doc-item-card:hover { border-color: #0d6efd; transform: scale(1.02); }
    .download-link { width: 34px; height: 34px; background: #eef2ff; color: #4338ca; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .download-link:hover { background: #4338ca; color: white; }
    
    .card-glow { position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(255,255,255,0.15); border-radius: 50%; filter: blur(40px); }
    .line-height-1 { line-height: 1; }
    
    .hover-scale:hover { transform: scale(1.02) translateX(4px); background: white !important; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1) !important; color: var(--primary) !important; }
    .hover-bg-danger:hover { background-color: #fef2f2 !important; color: #dc2626 !important; }
    .hover-bg-danger:hover .icon-danger { background-color: #dc2626 !important; color: white !important; }

    .seniority-ring { text-align: center; border-right: 2px dashed #e2e8f0; padding-right: 15px; }
    .sticky-sidebar { position: sticky; top: 100px; }
    .border-dashed { border-style: dashed !important; }
    .cursor-pointer { cursor: pointer; }
    .hover-scale:hover { transform: scale(1.2); }
  `]
})
export class PersonnelDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly employeeService = inject(EmployeeService);
  private readonly documentService = inject(DocumentService);
  private readonly leaveService = inject(LeaveService);
  private readonly payrollService = inject(PayrollService);
  private readonly performanceService = inject(PerformanceService);

  employee = signal<any | null>(null);
  loading = signal(true);
  today = new Date();
  
  // Döküman Yönetimi
  documents = signal<any[]>([]);
  showUpload = signal(false);
  uploading = signal(false);
  selectedFile = signal<File | null>(null);

  // İzin Yönetimi
  leaveBalance = signal<any>(null);
  leaves = signal<any[]>([]);

  // Bordro Yönetimi
  payrolls = signal<any[]>([]);
  calculating = signal(false);

  // Performans Yönetimi
  evaluations = signal<any[]>([]);
  showEvalForm = signal(false);
  savingEval = signal(false);
  evalModel = { periodTitle: '', score: 5, reviewNotes: '' };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmployee(id);
      this.loadDocuments(id);
      this.loadLeaveBalance(id);
      this.loadLeaves(id);
      this.loadPayrolls(id);
      this.loadPerformance(id);
    }
  }

  loadEmployee(id: string): void {
    this.employeeService.getEmployee(id).subscribe({
      next: (res) => {
        this.employee.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadDocuments(id: string): void {
    this.documentService.getDocuments(id).subscribe(res => this.documents.set(res));
  }

  loadLeaveBalance(id: string): void {
    this.leaveService.getLeaveBalance(id).subscribe(res => this.leaveBalance.set(res));
  }

  loadLeaves(id: string): void {
    this.leaveService.getEmployeeLeaves(id).subscribe(res => this.leaves.set(res));
  }

  loadPayrolls(id: string): void {
    this.payrollService.getEmployeePayrolls(id).subscribe(res => this.payrolls.set(res));
  }

  loadPerformance(id: string): void {
    this.performanceService.getEmployeePerformance(id).subscribe(res => this.evaluations.set(res));
  }

  saveEvaluation(): void {
    const emp = this.employee();
    if (!emp) return;

    this.savingEval.set(true);
    const payload = {
      employeeId: emp.id,
      evaluatorId: null, 
      ...this.evalModel
    };

    this.performanceService.createEvaluation(payload).subscribe({
      next: () => {
        this.savingEval.set(false);
        this.showEvalForm.set(false);
        this.evalModel = { periodTitle: '', score: 5, reviewNotes: '' };
        this.loadPerformance(emp.id);
      },
      error: () => this.savingEval.set(false)
    });
  }

  calculateCurrentMonth(): void {
    const emp = this.employee();
    if (!emp) return;

    const now = new Date();
    this.calculating.set(true);
    this.payrollService.calculatePayroll(emp.id, now.getFullYear(), now.getMonth() + 1).subscribe({
      next: () => {
        this.calculating.set(false);
        this.loadPayrolls(emp.id);
      },
      error: () => this.calculating.set(false)
    });
  }

  calculateSeniority(hireDate: string): number {
    const start = new Date(hireDate);
    const end = new Date();
    const diff = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  calculateSeverancePay(hireDate: string, baseSalary: number): number {
    const years = this.calculateSeniority(hireDate) / 365;
    if (years < 1) return 0;
    // Basit kıdem tazminatı: Çalışılan yıl x son brüt maaş (Tavan ücreti ihmal edilmiştir)
    return Math.floor(years * baseSalary);
  }

  toggleUpload() { this.showUpload.update(v => !v); }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile.set(file);
  }

  uploadDoc(description: string) {
    const file = this.selectedFile();
    const empId = this.employee()?.id;
    if (!file || !empId) return;

    this.uploading.set(true);
    this.documentService.uploadDocument(empId, file, description).subscribe({
      next: () => {
        this.uploading.set(false);
        this.showUpload.set(false);
        this.selectedFile.set(null);
        this.loadDocuments(empId);
      },
      error: () => this.uploading.set(false)
    });
  }

  getDownloadUrl(id: string) { return this.documentService.getDownloadUrl(id); }
}
