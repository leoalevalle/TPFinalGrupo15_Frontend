import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HelloResponse {
  message: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class HelloService {
  private apiUrl = 'https://tpfinalgrupo15-backend.onrender.com/api/hello';
  //private apiUrl = 'http://localhost:3000/api/hello';

  constructor(private http: HttpClient) { }

  getHelloMessage(): Observable<HelloResponse> {
    return this.http.get<HelloResponse>(this.apiUrl);
  }
}