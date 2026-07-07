import { Routes } from '@angular/router';
import { Hello } from './components/hello/hello';
import { Conductora } from './components/conductora/conductora';
import { Admin } from './components/admin/admin';

export const routes: Routes = [
    { path: 'hello', component: Hello },
    { path: 'conductora', component: Conductora },
    { path: 'admin', component: Admin},
    { path: '', redirectTo: '/hello', pathMatch: 'full'},
    { path: '**', redirectTo: '/hello' }
];
