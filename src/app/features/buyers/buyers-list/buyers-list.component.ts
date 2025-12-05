import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { BuyersService, BuyerWithStandCount } from '../../../core/services/buyers.service';

type AddBuyerForm = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  nationalIdentityNumber: string;
};

@Component({
  selector: 'app-buyers-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buyers-list.component.html',
  styleUrls: ['./buyers-list.component.css']
})
export class BuyersListComponent implements OnInit {
  protected buyers = signal<BuyerWithStandCount[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  protected showAddBuyerModal = signal(false);
  protected addBuyerForm: AddBuyerForm = this.buildDefaultAddBuyerForm();
  protected addBuyerSubmitting = signal(false);
  protected addBuyerError = signal<string | null>(null);
  protected addBuyerSuccess = signal<string | null>(null);

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

  protected openAddBuyerModal(): void {
    this.showAddBuyerModal.set(true);
    this.addBuyerForm = this.buildDefaultAddBuyerForm();
    this.addBuyerError.set(null);
    this.addBuyerSuccess.set(null);
  }

  protected closeAddBuyerModal(): void {
    this.showAddBuyerModal.set(false);
    this.addBuyerForm = this.buildDefaultAddBuyerForm();
    this.addBuyerError.set(null);
    this.addBuyerSuccess.set(null);
  }

  protected handleAddBuyerSubmit(event: Event): void {
    event.preventDefault();

    if (!this.validateAddBuyerForm()) {
      this.addBuyerError.set('Please complete all required fields.');
      return;
    }

    const payload = this.buildAddBuyerPayload();
    if (!payload) {
      this.addBuyerError.set('Please provide valid buyer details.');
      return;
    }

    this.addBuyerSubmitting.set(true);
    this.addBuyerError.set(null);
    this.addBuyerSuccess.set(null);

    this.buyersService
      .createBuyer(payload)
      .pipe(finalize(() => this.addBuyerSubmitting.set(false)))
      .subscribe({
        next: (buyer: any) => {
          const firstName = buyer?.firstName || this.addBuyerForm.firstName;
          const lastName = buyer?.lastName || this.addBuyerForm.lastName;
          this.addBuyerSuccess.set(`${firstName} ${lastName} was added successfully.`);
          this.addBuyerForm = this.buildDefaultAddBuyerForm();
          // Refresh the buyers list after a short delay to show success message
          setTimeout(() => {
            this.loadBuyers();
            this.closeAddBuyerModal();
          }, 1500);
        },
        error: (err) => {
          this.addBuyerError.set(
            err?.error?.message ||
              err?.message ||
              'Unable to add the buyer right now. Please try again shortly.'
          );
        }
      });
  }

  private validateAddBuyerForm(): boolean {
    return (
      !!this.addBuyerForm.firstName.trim() &&
      !!this.addBuyerForm.lastName.trim() &&
      !!this.addBuyerForm.email.trim() &&
      !!this.addBuyerForm.phoneNumber.trim() &&
      !!this.addBuyerForm.password.trim()
    );
  }

  private buildAddBuyerPayload(): Record<string, unknown> | null {
    if (!this.validateAddBuyerForm()) {
      return null;
    }

    return {
      firstName: this.addBuyerForm.firstName.trim(),
      lastName: this.addBuyerForm.lastName.trim(),
      email: this.addBuyerForm.email.trim(),
      phoneNumber: this.addBuyerForm.phoneNumber.trim(),
      password: this.addBuyerForm.password.trim()
    };
  }

  private buildDefaultAddBuyerForm(): AddBuyerForm {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      nationalIdentityNumber: ''
    };
  }
}
