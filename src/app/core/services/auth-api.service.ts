import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, LoginRequest, LoginResponse, SignupRequest, AuthUser, UpdateUserProfileRequest, UpdateUserProfileResponse } from '../models/auth.model';

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

  updateProfile(payload: UpdateUserProfileRequest, file?: File): Observable<ApiResponse<UpdateUserProfileResponse>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sms_auth_token') : null;
    const headers: { [key: string]: string } = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (file) {
      // Use multipart/form-data when file is provided
      const formData = new FormData();
      
      if (payload.dateOfBirth) {
        formData.append('dateOfBirth', payload.dateOfBirth);
      }
      if (payload.nationalIdentityNumber) {
        formData.append('nationalIdentityNumber', payload.nationalIdentityNumber);
      }
      if (payload.gender) {
        formData.append('gender', payload.gender);
      }
      formData.append('profilePicture', file);

      return this.http.put<ApiResponse<UpdateUserProfileResponse>>(
        `${API_BASE_URL}/auth/update-profile`,
        formData,
        { headers }
      );
    } else {
      // Use application/json when no file (or base64 string provided)
      headers['Content-Type'] = 'application/json';
      return this.http.put<ApiResponse<UpdateUserProfileResponse>>(
        `${API_BASE_URL}/auth/update-profile`,
        payload,
        { headers }
      );
    }
  }
}

