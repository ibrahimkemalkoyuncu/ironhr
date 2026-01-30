import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/**
 * IRONHR - İZİN SERVİSİ (LEAVE SERVICE)
 */
@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5118/api';

  /**
   * Yeni izin talebi oluşturur.
   */
  requestLeave(command: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/leaves`, command);
  }

  /**
   * Personelin izin bakiyesini getirir.
   */
  getLeaveBalance(employeeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employees/${employeeId}/leave-balance`).pipe(
      map(res => res.value)
    );
  }

  /**
   * İzin türlerini listeler.
   */
  getLeaveTypes(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/leave-types`).pipe(
      map(res => res.value)
    );
  }

  /**
   * Personelin izin geçmişini listeler.
   */
  getEmployeeLeaves(employeeId: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/employees/${employeeId}/leaves`).pipe(
      map(res => res.value)
    );
  }

  /**
   * Onay bekleyen tüm izin taleplerini getirir (Yönetici için).
   */
  getPendingLeaves(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/leaves/pending`).pipe(
      map(res => res.value)
    );
  }

  /**
   * İzin talebini onaylar veya reddeder.
   * status: 1 (Onay), 2 (Red)
   */
  processLeave(requestId: string, status: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/leaves/${requestId}/process?status=${status}`, {});
  }

  /**
   * Takvim için izin verilerini getirir.
   */
  getCalendarLeaves(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/leaves/calendar`).pipe(
      map(res => res.value)
    );
  }
}
