import { Routes } from '@angular/router';
import { Hello } from './components/hello/hello';
import { Conductora } from './components/conductora/conductora';

export const routes: Routes = [
    { path: 'hello', component: Hello },
    { path: 'conductora', component: Conductora },
    { path: '', redirectTo: '/hello', pathMatch: 'full'},
    { path: '**', redirectTo: '/hello' }
];
