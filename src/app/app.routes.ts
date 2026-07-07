import { Routes } from '@angular/router';
import { Hello } from './components/hello/hello';

import { Conductora } from './components/conductora/conductora';
import { Pasajera } from './components/pasajera/pasajera';
import { Administradora } from './components/administradora/administradora';
import { Operadora } from './components/operadora/operadora';

export const routes: Routes = [
  { path: 'hello', component: Hello },
  { path: 'conductora', component: Conductora },
  { path: 'pasajera', component: Pasajera },
  { path: 'administradora', component: Administradora },
  { path: 'operadora', component: Operadora },
  { path: '', redirectTo: '/hello', pathMatch: 'full' },
  { path: '**', redirectTo: '/hello' }, // SIEMPRE al final
];
