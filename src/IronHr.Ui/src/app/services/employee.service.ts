import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/**
 * IRONHR - PERSONEL SERVİSİ (EMPLOYEE SERVICE)
 * Personel ile ilgili API çağrılarını yönetir.
 */
@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5118/api/employees';

  /**
   * Tüm aktif personelleri listeler.
   */
  getEmployees(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => res.value)
    );
  }

  /**
   * Belirli bir personeli detaylarıyla getirir.
   */
  getEmployee(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.value)
    );
  }

  /**
   * Personel bilgilerini günceller.
   */
  updateEmployee(id: string, employee: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, employee);
  }

  /**
   * Yeni bir personel kaydı oluşturur.
   * @param employee Personel verileri.
   */
  createEmployee(employee: any): Observable<any> {
    // Mete Bey'in hazırladığı API'ye POST isteği atar.
    return this.http.post(this.apiUrl, employee);
  }
}
