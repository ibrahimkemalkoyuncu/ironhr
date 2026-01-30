import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/**
 * IRONHR - DASHBOARD SERVİSİ
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5118/api';

  /**
   * Dashboard özet verilerini getirir.
   */
  getSummary(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/summary`).pipe(
      map(res => res.value)
    );
  }
}
