import { Routes } from '@angular/router';
import { Hello } from './components/hello/hello';

import { Conductora } from './components/conductora/conductora';
import { Pasajera } from './components/pasajera/pasajera';
import { Admin } from './components/admin/admin';
//import { Admin } from './components/admin/admin';
import { Operadora } from './components/operadora/operadora';

export const routes: Routes = [
  { path: 'hello', component: Hello },
  { path: 'conductora', component: Conductora },
  { path: 'pasajera', component: Pasajera },
  { path: 'administradora', component: Admin },
  //{ path: 'admin', component: Admin},
  { path: 'operadora', component: Operadora },
  { path: '', redirectTo: '/hello', pathMatch: 'full' },
  { path: '**', redirectTo: '/hello' }, // SIEMPRE al final
];
