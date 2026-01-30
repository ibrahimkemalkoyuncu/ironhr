import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/**
 * IRONHR - BORDRO SERVİSİ
 * Personel maaş hesaplama ve bordro geçmişi işlemlerini yönetir.
 */
@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5118/api';

  /**
   * Personel için bordro hesaplar.
   */
  calculatePayroll(employeeId: string, year: number, month: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/payrolls/calculate`, { employeeId, year, month }).pipe(
      map(res => res.value)
    );
  }

  /**
   * Personelin bordro geçmişini listeler.
   */
  getEmployeePayrolls(employeeId: string): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/employees/${employeeId}/payrolls`).pipe(
      map(res => res.value)
    );
  }
}
