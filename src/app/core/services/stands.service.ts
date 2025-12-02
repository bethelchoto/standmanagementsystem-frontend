import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Stand, StandsResponse } from '../models/stand.model';
import { Buyer, StandBuyerLink } from '../models/buyer.model';

const API_BASE_URL = 'https://standmanagementsystem.vercel.app/api';

type StandPayload = Record<string, unknown>;

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface ApiCollectionResponse<T> {
  success: boolean;
  data: T[];
}

export interface StandStatusRequest {
  status: string;
  buyerUserId?: string;
  allocationType?: string;
  allocationNote?: string;
}

export interface StandStatusResponse {
  status: string;
  buyerLinks?: StandBuyerLink[];
}

@Injectable({
  providedIn: 'root'
})
export class StandsService {
  private readonly http = inject(HttpClient);

  getStands(): Observable<Stand[]> {
    return this.http
      .get<StandsResponse>(`${API_BASE_URL}/stands`, {
        headers: this.buildAuthHeaders()
      })
      .pipe(map((response) => response.data));
  }

  getStandById(standId: string): Observable<Stand> {
    return this.http
      .get<ApiResponse<Stand>>(`${API_BASE_URL}/stands/${standId}`, {
        headers: this.buildAuthHeaders()
      })
      .pipe(map((response) => response.data));
  }

  createStand(payload: StandPayload): Observable<Stand> {
    return this.http
      .post<ApiResponse<Stand>>(`${API_BASE_URL}/stands`, payload, {
        headers: this.buildAuthHeaders()
      })
      .pipe(map((response) => response.data));
  }

  bulkCreateStands(payload: StandPayload): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${API_BASE_URL}/stands/bulk`, payload, {
      headers: this.buildAuthHeaders()
    });
  }

  updateStand(standId: string, payload: StandPayload): Observable<Stand> {
    return this.http
      .patch<ApiResponse<Stand>>(`${API_BASE_URL}/stands/${standId}`, payload, {
        headers: this.buildAuthHeaders()
      })
      .pipe(map((response) => response.data));
  }

  updateStandStatus(standId: string, payload: StandStatusRequest): Observable<StandStatusResponse> {
    return this.http
      .patch<ApiResponse<StandStatusResponse>>(`${API_BASE_URL}/stands/${standId}/status`, payload, {
        headers: this.buildAuthHeaders()
      })
      .pipe(map((response) => response.data));
  }

  deleteStand(standId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<unknown>>(`${API_BASE_URL}/stands/${standId}`, {
        headers: this.buildAuthHeaders()
      })
      .pipe(map(() => void 0));
  }

  getStandBuyers<T = Buyer>(standId: string): Observable<T[]> {
    return this.http
      .get<ApiCollectionResponse<T>>(`${API_BASE_URL}/stands/${standId}/buyers`, {
        headers: this.buildAuthHeaders()
      })
      .pipe(map((response) => response.data));
  }

  addBuyerToStand<T = Buyer>(standId: string, payload: Record<string, unknown>): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${API_BASE_URL}/stands/${standId}/buyers`, payload, {
        headers: this.buildAuthHeaders()
      })
      .pipe(map((response) => response.data));
  }

  getStandBuyerLinks<T = StandBuyerLink>(standId: string): Observable<T[]> {
    return this.http
      .get<ApiCollectionResponse<T>>(`${API_BASE_URL}/stands/${standId}/buyer-links`, {
        headers: this.buildAuthHeaders()
      })
      .pipe(map((response) => response.data));
  }

  linkBuyerUserToStand<T = StandBuyerLink>(standId: string, payload: Record<string, unknown>): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${API_BASE_URL}/stands/${standId}/buyer-links`, payload, {
        headers: this.buildAuthHeaders()
      })
      .pipe(map((response) => response.data));
  }

  releaseStandBuyerLink<T = StandBuyerLink>(
    standId: string,
    linkId: string,
    payload: Record<string, unknown>
  ): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(`${API_BASE_URL}/stands/${standId}/buyer-links/${linkId}/release`, payload, {
        headers: this.buildAuthHeaders()
      })
      .pipe(map((response) => response.data));
  }

  getStandTransactions<T = unknown>(standId: string): Observable<T[]> {
    return this.http
      .get<ApiCollectionResponse<T>>(`${API_BASE_URL}/stands/${standId}/transactions`, {
        headers: this.buildAuthHeaders()
      })
      .pipe(map((response) => response.data));
  }

  createStandTransaction<T = unknown>(standId: string, payload: Record<string, unknown>): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${API_BASE_URL}/stands/${standId}/transactions`, payload, {
        headers: this.buildAuthHeaders()
      })
      .pipe(map((response) => response.data));
  }

  triggerStandDueDateCheck(): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${API_BASE_URL}/stands/check-due-dates`, null, {
      headers: this.buildAuthHeaders()
    });
  }

  private buildAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const token = typeof window !== 'undefined' ? localStorage.getItem('sms_auth_token') : null;

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }
}

