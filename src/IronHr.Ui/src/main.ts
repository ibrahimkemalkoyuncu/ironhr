/**
 * IRONHR - FRONTEND ANA GİRİŞ NOKTASI
 * Uygulamanın tarayıcı üzerinde başlatıldığı yerdir (Bootstrapping).
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Uygulamayı ana bileşen (App) ve genel konfigürasyon (appConfig) ile başlatır.
bootstrapApplication(App, appConfig).catch((err) =>
  console.error('Uygulama başlatılırken hata oluştu:', err),
);
