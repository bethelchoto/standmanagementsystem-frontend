import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Stand, StandsResponse } from '../models/stand.model';

const API_BASE_URL = 'https://standmanagementsystem.vercel.app/api';

@Injectable({
  providedIn: 'root'
})
export class StandsService {
  private readonly http = inject(HttpClient);

  getStands(): Observable<Stand[]> {
    const headers: Record<string, string> = {};
    const token = typeof window !== 'undefined' ? localStorage.getItem('sms_auth_token') : null;

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.http.get<StandsResponse>(`${API_BASE_URL}/stands`, { headers }).pipe(map((response) => response.data));
  }
}

