import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNgIconsConfig } from '@ng-icons/core';

import { routes } from './app.routes';
import { jwtInterceptor } from '../security/core/interceptors/jwt.interceptor';
import { clientAuthInterceptor } from '../security/core/interceptors/client-auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor, clientAuthInterceptor])),
    provideAnimations(),
    provideNgIconsConfig({
      size: '1.25rem',
    }),
  ],
};
