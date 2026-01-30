/**
 * IRONHR - ŞİRKET SERVİSİ (COMPANY SERVICE)
 * Şirket ile ilgili API çağrılarını yönetir.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Şirket oluşturma isteği için veri modeli.
 */
export interface CreateCompanyRequest {
  name: string;
  taxNumber: string;
  taxOffice: string;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5118/api/companies'; // Backend API adresi

  /**
   * Yeni bir şirket kaydı oluşturur.
   * @param request Şirket bilgileri
   * @returns Oluşturulan şirketin GUID numarası
   */
  createCompany(request: CreateCompanyRequest): Observable<string> {
    return this.http.post<string>(this.apiUrl, request);
  }
}
