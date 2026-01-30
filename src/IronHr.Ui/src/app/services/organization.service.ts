import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/**
 * IRONHR - ORGANİZASYON SERVİSİ
 * Şirket, Şube ve Departman listeleme işlemlerini yönetir.
 */
@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5118/api';

  /**
   * Tüm aktif şirketleri listeler.
   */
  getCompanies(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/companies`).pipe(
      map(res => res.value)
    );
  }

  /**
   * Belirli bir şirketi getirir.
   */
  getCompany(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/companies/${id}`).pipe(map(res => res.value));
  }

  createCompany(company: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/companies`, company);
  }

  updateCompany(id: string, company: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/companies/${id}`, company);
  }

  /**
   * Şubeleri listeler (Şirket bazlı filtrelenebilir).
   */
  getBranches(companyId?: string): Observable<any[]> {
    let url = `${this.baseUrl}/branches`;
    if (companyId) url += `?companyId=${companyId}`;
    return this.http.get<any>(url).pipe(
      map(res => res.value)
    );
  }

  getBranch(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/branches/${id}`).pipe(map(res => res.value));
  }

  createBranch(branch: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/branches`, branch);
  }

  updateBranch(id: string, branch: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/branches/${id}`, branch);
  }

  /**
   * Departmanları listeler (Şube bazlı filtrelenebilir).
   */
  getDepartments(branchId?: string): Observable<any[]> {
    let url = `${this.baseUrl}/departments`;
    if (branchId) url += `?branchId=${branchId}`;
    return this.http.get<any>(url).pipe(
      map(res => res.value)
    );
  }

  getDepartment(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/departments/${id}`).pipe(map(res => res.value));
  }

  createDepartment(dept: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/departments`, dept);
  }

  updateDepartment(id: string, dept: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/departments/${id}`, dept);
  }
}
