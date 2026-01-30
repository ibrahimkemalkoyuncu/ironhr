import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Tarayıcı seviyesindeki genel hataları dinleyen ve yöneten servis.
    provideBrowserGlobalErrorListeners(),
    // Uygulama rotalarını (Routes) Angular'a tanıtan servis.
    provideRouter(routes),
    // HTTP istekleri için gerekli servis.
    provideHttpClient()
  ]
};
