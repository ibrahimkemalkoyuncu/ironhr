import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/**
 * IRONHR - PERFORMANS SERVİSİ
 */
@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5118/api';

  /**
   * Personel için performans değerlendirmesi oluşturur.
   */
  createEvaluation(evaluation: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/performance/evaluations`, evaluation).pipe(
      map(res => res.value)
    );
  }

  /**
   * Personelin performans geçmişini listeler.
   */
  getEmployeePerformance(employeeId: string): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/employees/${employeeId}/performance`).pipe(
      map(res => res.value)
    );
  }
}
