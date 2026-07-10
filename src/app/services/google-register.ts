import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleRegister {

  private registrarSubject = new Subject<any>();

  registrar$ = this.registrarSubject.asObservable();

  abrirRegistro(datos:any){
      this.registrarSubject.next(datos);
  }

}