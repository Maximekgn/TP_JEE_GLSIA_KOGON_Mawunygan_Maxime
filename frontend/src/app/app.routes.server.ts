import { RenderMode, ServerRoute } from '@angular/ssr';
import { Routes } from '@angular/router';
import { Clients } from './clients/clients';


export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
