import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BuyersService, BuyerWithStandCount } from '../../../core/services/buyers.service';

@Component({
  selector: 'app-buyers-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buyers-list.component.html',
  styleUrls: ['./buyers-list.component.css']
})
export class BuyersListComponent implements OnInit {
  protected buyers = signal<BuyerWithStandCount[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  constructor(private readonly buyersService: BuyersService) {}

  ngOnInit(): void {
    this.loadBuyers();
  }

  private loadBuyers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.buyersService
      .getAllBuyersWithStandCounts()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (buyers) => {
          this.buyers.set(buyers);
        },
        error: (err) => {
          this.error.set(
            err?.error?.message || err?.message || 'Failed to load buyers. Please try again later.'
          );
          this.buyers.set([]);
        }
      });
  }

  protected formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch {
      return dateString;
    }
  }

  protected refresh(): void {
    this.loadBuyers();
  }

  protected trackByBuyerId(index: number, buyer: BuyerWithStandCount): string {
    return buyer.id;
  }
}
