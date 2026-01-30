import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveService } from '../../services/leave.service';

/**
 * IRONHR - İZİN TAKVİMİ (LEAVE CALENDAR COMPONENT)
 * Şirket genelindeki izinleri görsel bir takvim üzerinde gösterir.
 */
@Component({
  selector: 'app-leave-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid mt-4 mb-5 px-lg-5 animate__animated animate__fadeIn">
      <!-- Üst Header Bölümü -->
      <div class="glass-card p-4 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 shadow-sm border-0 rounded-4">
        <div>
          <h2 class="fw-bold mb-0 text-gradient d-flex align-items-center">
            <i class="bi bi-calendar-range-fill me-3"></i>İzin Takvimi
          </h2>
          <p class="text-muted mb-0 fw-medium opacity-75">
            {{ currentMonthName() }} {{ currentYear() }} - Operasyonel İzin Yönetimi
          </p>
        </div>
        
        <div class="d-flex align-items-center gap-2">
          <div class="btn-group shadow-sm rounded-pill overflow-hidden border p-1 bg-white">
            <button class="btn btn-link link-dark text-decoration-none px-3 border-0 rounded-pill hover-bg-light" (click)="prevMonth()">
              <i class="bi bi-chevron-left"></i>
            </button>
            <button class="btn btn-primary px-4 fw-bold rounded-pill mx-1 shadow-sm" (click)="today()">Bugün</button>
            <button class="btn btn-link link-dark text-decoration-none px-3 border-0 rounded-pill hover-bg-light" (click)="nextMonth()">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Takvim Alanı -->
      <div class="calendar-container shadow-lg rounded-4 overflow-hidden bg-white border">
        <!-- Gün Başlıkları -->
        <div class="calendar-weekdays border-bottom bg-light">
          <div class="weekday-item" title="Pazartesi">Pzt</div>
          <div class="weekday-item" title="Salı">Sal</div>
          <div class="weekday-item" title="Çarşamba">Çar</div>
          <div class="weekday-item" title="Perşembe">Per</div>
          <div class="weekday-item" title="Cuma">Cum</div>
          <div class="weekday-item" title="Cumartesi">Cmt</div>
          <div class="weekday-item" title="Pazar">Paz</div>
        </div>

        <!-- Takvim Izgarası -->
        <div class="calendar-grid">
          @for (day of calendarDays(); track day.dateString) {
            <div class="calendar-day" 
                 [class.other-month]="!day.isCurrentMonth"
                 [class.is-today]="day.isToday">
              
              <div class="day-header">
                <span class="day-number shadow-sm" [class.today-circle]="day.isToday" title="Ayın Günü">{{ day.dayNumber }}</span>
                @if (getLeavesForDate(day.date).length > 0) {
                  <span class="leave-count-badge" title="Bu gündeki toplam izinli personel sayısı">
                    {{ getLeavesForDate(day.date).length }}
                  </span>
                }
              </div>
              
              <div class="leaves-box">
                @let dayLeaves = getLeavesForDate(day.date);
                @for (leave of dayLeaves.slice(0, 5); track leave.id) {
                  <div class="leave-pill" 
                       [class.pending]="leave.status === 0"
                       [class.approved]="leave.status === 1"
                       [title]="leave.employeeName + ' (' + leave.leaveTypeName + ')'">
                    <span class="indicator"></span>
                    <span class="emp-name">{{ leave.employeeName }}</span>
                  </div>
                }
                
                @if (dayLeaves.length > 5) {
                  <div class="more-indicator">
                    +{{ dayLeaves.length - 5 }} Diğer...
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Legend & Footer -->
      <div class="d-flex flex-wrap gap-4 mt-4 justify-content-center pt-2">
        <div class="legend-item">
          <span class="badge-dot bg-warning"></span>
          <span class="legend-text">Bekleyen Talepler</span>
        </div>
        <div class="legend-item">
          <span class="badge-dot bg-success"></span>
          <span class="legend-text">Onaylı İzinler</span>
        </div>
        <div class="legend-item ms-md-4">
          <i class="bi bi-info-circle text-primary me-2"></i>
          <span class="legend-text italic">Hücrelerdeki sayılar o gündeki toplam izinli sayısını gösterir.</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { --primary-gradient: linear-gradient(135deg, #0d6efd 0%, #004aad 100%); }
    .text-gradient { background: var(--primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.3); }
    .hover-bg-light:hover { background: #f8f9fa; }
    
    .calendar-container { min-width: 900px; }
    .calendar-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); background: #f8fafc; }
    .weekday-item { padding: 15px; text-align: center; font-weight: 700; color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; border-right: 1px solid #e2e8f0; }
    .weekday-item:last-child { border-right: none; }

    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); background: #e2e8f0; gap: 1px; border-top: 1px solid #e2e8f0; }
    .calendar-day { background: white; min-height: 140px; padding: 10px; position: relative; transition: all 0.2s ease; display: flex; flex-direction: column; overflow: hidden; }
    .calendar-day:hover { background: #f1f5f9; z-index: 2; transform: scale(1.02); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-radius: 8px; margin: -1px; }
    .calendar-day.other-month { background: #f8fafc; color: #cbd5e1; }
    .calendar-day.other-month .day-number { opacity: 0.5; }
    
    .day-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; }
    .day-number { font-weight: 800; color: #1e293b; font-size: 0.9rem; padding: 4px 8px; transition: all 0.3s; }
    .today-circle { background: #004aad; color: white !important; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    
    .leave-count-badge { background: #f1f5f9; color: #64748b; font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 6px; border: 1px solid #e2e8f0; }

    .leaves-box { display: flex; flex-direction: column; gap: 3px; flex-grow: 1; overflow-y: auto; scrollbar-width: none; }
    .leaves-box::-webkit-scrollbar { display: none; }

    .leave-pill { font-size: 0.68rem; padding: 3px 8px; border-radius: 6px; display: flex; align-items: center; gap: 6px; transition: transform 0.1s; border: 1px solid transparent; }
    .leave-pill:hover { transform: translateX(3px); }
    .leave-pill.pending { background: #fffcf0; color: #854d0e; border-color: #fef08a; }
    .leave-pill.approved { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
    
    .indicator { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
    .emp-name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .more-indicator { font-size: 0.6rem; font-weight: 700; color: #94a3b8; text-align: center; padding: 2px; }

    .legend-item { display: flex; align-items: center; gap: 10px; padding: 6px 16px; background: white; border-radius: 20px; border: 1px solid #e2e8f0; shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .badge-dot { width: 10px; height: 10px; border-radius: 50%; }
    .legend-text { font-size: 0.82rem; font-weight: 600; color: #475569; }
    .legend-text.italic { font-style: italic; font-weight: 400; color: #64748b; }

    @media (max-width: 992px) {
      .calendar-container { overflow-x: auto; }
    }
  `]
})
export class LeaveCalendarComponent implements OnInit {
  private readonly leaveService = inject(LeaveService);

  weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  currentDate = signal(new Date());
  leaves = signal<any[]>([]);

  currentYear = computed(() => this.currentDate().getFullYear());
  currentMonth = computed(() => this.currentDate().getMonth());
  currentMonthName = computed(() => {
    return new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(this.currentDate());
  });

  calendarDays = computed(() => this.generateCalendarDays(this.currentYear(), this.currentMonth()));

  ngOnInit(): void {
    this.loadLeaves();
  }

  loadLeaves() {
    this.leaveService.getCalendarLeaves().subscribe(res => this.leaves.set(res));
  }

  private generateCalendarDays(year: number, month: number) {
    const days = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Ayın ilk gününün haftanın kaçıncı günü olduğunu bul (Pazartesi=0 yapmak için)
    let startDayIdx = firstDay.getDay() - 1;
    if (startDayIdx === -1) startDayIdx = 6; // Pazar günü ise 6 yap

    // Önceki aydan sarkan günler
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIdx - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(this.createDayObj(d, false));
    }

    // Bu ayın günleri
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push(this.createDayObj(d, true));
    }

    // Sonraki aydan sarkan günler (Takvimi 6 satıra - 42 güne tamamlamak için)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      days.push(this.createDayObj(d, false));
    }

    return days;
  }

  private createDayObj(date: Date, isCurrentMonth: boolean) {
    const today = new Date();
    return {
      date: new Date(date),
      dateString: date.toDateString(),
      dayNumber: date.getDate(),
      isCurrentMonth,
      isToday: date.getDate() === today.getDate() && 
               date.getMonth() === today.getMonth() && 
               date.getFullYear() === today.getFullYear()
    };
  }

  getLeavesForDate(date: Date) {
    return this.leaves().filter(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      // Sadece saatsiz karşılaştırma
      const check = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      return check >= s && check <= e;
    });
  }

  prevMonth() {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth() {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  today() {
    this.currentDate.set(new Date());
  }
}
