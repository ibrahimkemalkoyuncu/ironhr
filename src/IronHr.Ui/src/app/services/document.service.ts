import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/**
 * IRONHR - DÖKÜMAN SERVİSİ (DOCUMENT SERVICE)
 * Personel döküman yükleme, listeleme ve indirme işlemlerini yönetir.
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5118/api';

  /**
   * Bir personele döküman yükler.
   */
  uploadDocument(employeeId: string, file: File, description: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);

    return this.http.post(`${this.apiUrl}/employees/${employeeId}/documents`, formData);
  }

  /**
   * Bir personelin dökümanlarını listeler.
   */
  getDocuments(employeeId: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/employees/${employeeId}/documents`).pipe(
      map(res => res.value)
    );
  }

  /**
   * Döküman indirme URL'sini döner.
   */
  getDownloadUrl(documentId: string): string {
    return `${this.apiUrl}/documents/${documentId}`;
  }
}
