import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Buyer, StandBuyerLink } from '../models/buyer.model';
import { StandsService } from './stands.service';

const API_BASE_URL = 'https://standmanagementsystem.vercel.app/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface BuyerWithStandCount extends Buyer {
  standCount: number;
  standIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BuyersService {
  private readonly http = inject(HttpClient);
  private readonly standsService = inject(StandsService);

  /**
   * Creates a standalone buyer account via the buyer signup endpoint (not linked to a stand).
   * Endpoint: POST /api/buyer-auth/signup
   */
  createBuyer(payload: Record<string, unknown>): Observable<unknown> {
    return this.http
      .post<ApiResponse<unknown>>(`${API_BASE_URL}/buyer-auth/signup`, payload, {
        headers: this.buildAuthHeaders()
      })
      .pipe(map((response) => response.data));
  }

  private buildAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const token = typeof window !== 'undefined' ? localStorage.getItem('sms_auth_token') : null;

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Fetches all buyers by aggregating buyers and buyer-links from all stands.
   * Returns unique buyers with their stand counts.
   */
  getAllBuyersWithStandCounts(): Observable<BuyerWithStandCount[]> {
    return this.standsService.getStands().pipe(
      switchMap((stands) => {
        if (stands.length === 0) {
          return of([]);
        }

        // Fetch buyers for all stands in parallel (buyer links disabled for now)
        const allRequests = stands.map((stand) =>
          forkJoin({
            buyers: this.standsService.getStandBuyers<Buyer>(stand.id).pipe(
              catchError(() => of([]))
            ),
            // buyerLinks: this.standsService.getStandBuyerLinks<StandBuyerLink>(stand.id).pipe(
            //   catchError(() => of([]))
            // )
            buyerLinks: of<StandBuyerLink[]>([])
          }).pipe(
            map(({ buyers, buyerLinks }) => ({
              standId: stand.id,
              buyers,
              buyerLinks
            }))
          )
        );

        return forkJoin(allRequests).pipe(
          map((standDataArray) => {
            // Create a map to aggregate buyers with their stand counts
            const buyerMap = new Map<string, BuyerWithStandCount>();

            // Process direct buyers and buyer-links
            standDataArray.forEach(({ standId, buyers, buyerLinks }) => {
              // Process direct buyers
              buyers.forEach((buyer) => {
                if (buyer && buyer.id) {
                  const buyerId = buyer.id;

                  if (buyerMap.has(buyerId)) {
                    const existingBuyer = buyerMap.get(buyerId)!;
                    if (!existingBuyer.standIds.includes(standId)) {
                      existingBuyer.standCount++;
                      existingBuyer.standIds.push(standId);
                    }
                  } else {
                    buyerMap.set(buyerId, {
                      ...buyer,
                      standCount: 1,
                      standIds: [standId]
                    });
                  }
                }
              });

              // Process buyer-links (disabled until stand buyer links endpoint is available)
              // buyerLinks.forEach((link: StandBuyerLink) => {
              //   if (link.buyer && link.buyer.id) {
              //     const buyerId = link.buyer.id;
              //
              //     if (buyerMap.has(buyerId)) {
              //       const existingBuyer = buyerMap.get(buyerId)!;
              //       if (!existingBuyer.standIds.includes(standId)) {
              //         existingBuyer.standCount++;
              //         existingBuyer.standIds.push(standId);
              //       }
              //     } else {
              //       buyerMap.set(buyerId, {
              //         ...link.buyer,
              //         standCount: 1,
              //         standIds: [standId]
              //       });
              //     }
              //   }
              // });
            });

            // Convert map to array and sort by name
            return Array.from(buyerMap.values()).sort((a, b) => {
              const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
              const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
              return nameA.localeCompare(nameB);
            });
          })
        );
      })
    );
  }
}
