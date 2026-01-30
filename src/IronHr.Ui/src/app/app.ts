/**
 * IRONHR - ANA BİLEŞEN (APP COMPONENT)
 * Tüm uygulamanın üzerinde yükseldiği kök bileşendir.
 */

import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root', // HTML içindeki etiketi: <app-root></app-root>
  imports: [RouterOutlet, RouterLink, RouterLinkActive], // Navigasyon için gerekli modüller
  templateUrl: './app.html', // Tasarım dosyası
  styleUrl: './app.css' // CSS stil dosyası
})
export class App {
  /**
   * Uygulama başlığı. Angular "Signals" yapısı kullanılarak 
   * reaktif (değişime duyarlı) bir değişken olarak tanımlanmıştır.
   */
  protected readonly title = signal('IRONHR (İnsan Kaynakları Yönetim Sistemi)');
}
