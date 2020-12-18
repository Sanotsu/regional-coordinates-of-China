import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class LoadJsonService {


  constructor(private http: HttpClient) { }

  loadpcas(n: number): Observable<any> {
    return this.http
      .get(`assets/json/provenceJson/pcas-code-provence${n}.json`);
  }

  noticeServer(): Observable<any> {
    return this.http.get('http://localhost:3000/noteStartLog');
  }

  pushDataToServer(data): Observable<any> {
    return this.http.post('http://localhost:3000/area', data);
  }
}
