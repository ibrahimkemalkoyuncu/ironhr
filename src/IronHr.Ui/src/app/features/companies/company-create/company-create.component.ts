/**
 * IRONHR - ŞİRKET OLUŞTURMA BİLEŞENİ (COMPANY CREATE COMPONENT)
 * Yeni şirket kayıt formunu ve mantığını yönetir.
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService, CreateCompanyRequest } from '../services/company.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-company-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-create.component.html',
  styleUrl: './company-create.component.css'
})
export class CompanyCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly companyService = inject(CompanyService);
  private readonly router = inject(Router);

  // İşlem durumunu takip etmek için sinyaller (Signals)
  protected isSubmitting = signal(false);
  protected errorMessage = signal<string | null>(null);
  protected successMessage = signal<string | null>(null);

  /**
   * Şirket kayıt formu tanımlaması ve kuralları.
   */
  protected companyForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    taxNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
    taxOffice: ['', [Validators.maxLength(100)]],
    address: ['', [Validators.required]]
  });

  /**
   * Formu gönderir ve backend ile iletişim kurar.
   */
  protected onSubmit(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const request = this.companyForm.value as CreateCompanyRequest;

    this.companyService.createCompany(request).subscribe({
      next: (id) => {
        this.isSubmitting.set(false);
        this.successMessage.set('Şirket başarıyla kaydedildi! Kayıt ID: ' + id);
        this.companyForm.reset();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.detail || 'Şirket kaydedilirken bir hata oluştu.');
        console.error('Kayıt hatası:', err);
      }
    });
  }
}
