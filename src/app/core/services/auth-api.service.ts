import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, LoginRequest, LoginResponse, SignupRequest, AuthUser } from '../models/auth.model';

const API_BASE_URL = 'https://standmanagementsystem.vercel.app/api';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly http = inject(HttpClient);

  login(payload: LoginRequest): Observable<HttpResponse<ApiResponse<LoginResponse>>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${API_BASE_URL}/auth/login`, payload, {
      observe: 'response'
    });
  }

  signup(payload: SignupRequest): Observable<ApiResponse<AuthUser>> {
    return this.http.post<ApiResponse<AuthUser>>(`${API_BASE_URL}/auth/signup`, payload);
  }
}

