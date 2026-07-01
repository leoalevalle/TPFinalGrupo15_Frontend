import { Routes } from '@angular/router';
import { Hello } from './components/hello/hello';

export const routes: Routes = [
    { path: 'hello', component: Hello },
    { path: '', redirectTo: '/hello', pathMatch: 'full'},
    { path: '**', redirectTo: '/hello' }
];
