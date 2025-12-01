import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Stand } from '../../../core/models/stand.model';
import { Buyer, StandBuyerLink } from '../../../core/models/buyer.model';
import { StandsService } from '../../../core/services/stands.service';

type AddBuyerForm = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdentityNumber: string;
  notes: string;
};

type LinkBuyerForm = {
  buyerUserId: string;
  notes: string;
};

@Component({
  selector: 'app-stand-buyers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './stand-buyers.component.html',
  styleUrls: ['./stand-buyers.component.css']
})
export class StandBuyersComponent implements OnInit, OnDestroy {
  protected standId = '';
  protected stand?: Stand;
  protected loadingStand = true;
  protected standError: string | null = null;

  protected buyers: Buyer[] = [];
  protected buyerLinks: StandBuyerLink[] = [];
  protected loadingBuyers = false;
  protected loadingBuyerLinks = false;

  protected addBuyerForm: AddBuyerForm = this.buildDefaultAddBuyerForm();
  protected addBuyerSubmitting = false;
  protected addBuyerSuccess: string | null = null;
  protected addBuyerError: string | null = null;

  protected linkBuyerForm: LinkBuyerForm = this.buildDefaultLinkBuyerForm();
  protected linkBuyerSubmitting = false;
  protected linkBuyerSuccess: string | null = null;
  protected linkBuyerError: string | null = null;

  private routeSubscription?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly standsService: StandsService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const standId = params.get('standId');

      if (!standId) {
        this.standError = 'A valid stand reference is required.';
        this.loadingStand = false;
        return;
      }

      this.standId = standId;
      this.fetchStand();
      this.refreshBuyerData();
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  protected navigateBack(): void {
    this.router.navigate(['/stands']);
  }

  protected handleAddBuyerSubmit(event: Event): void {
    event.preventDefault();

    if (!this.validateAddBuyerForm()) {
      this.addBuyerError = 'Please complete all required buyer fields.';
      return;
    }

    const payload = this.buildAddBuyerPayload();
    if (!payload) {
      this.addBuyerError = 'Please provide valid buyer details.';
      return;
    }

    this.addBuyerSubmitting = true;
    this.addBuyerError = null;
    this.addBuyerSuccess = null;

    this.standsService
      .addBuyerToStand<Buyer>(this.standId, payload)
      .pipe(finalize(() => (this.addBuyerSubmitting = false)))
      .subscribe({
        next: (buyer) => {
          this.addBuyerSuccess = `${buyer.firstName} ${buyer.lastName} was added successfully.`;
          this.addBuyerForm = this.buildDefaultAddBuyerForm();
          this.loadBuyers();
        },
        error: () => {
          this.addBuyerError = 'Unable to add the buyer right now. Please try again shortly.';
        }
      });
  }

  protected handleLinkBuyerSubmit(event: Event): void {
    event.preventDefault();
    const payload = this.buildLinkBuyerPayload();

    if (!payload) {
      this.linkBuyerError = 'Provide a valid buyer user ID or email to link.';
      return;
    }

    this.linkBuyerSubmitting = true;
    this.linkBuyerError = null;
    this.linkBuyerSuccess = null;

    this.standsService
      .linkBuyerUserToStand<StandBuyerLink>(this.standId, payload)
      .pipe(finalize(() => (this.linkBuyerSubmitting = false)))
      .subscribe({
        next: (link) => {
          this.linkBuyerSuccess = 'Buyer account linked to this stand.';
          this.linkBuyerForm = this.buildDefaultLinkBuyerForm();
          this.loadBuyerLinks();
        },
        error: () => {
          this.linkBuyerError = 'Unable to link that buyer user. Confirm the identifier and try again.';
        }
      });
  }

  protected handleReleaseLink(link: StandBuyerLink): void {
    if (!link.id) {
      return;
    }

    let reason = 'Released via dashboard';
    if (typeof window !== 'undefined') {
      const promptValue = window.prompt('Add a reason for releasing this buyer link.', '');
      if (promptValue === null) {
        return;
      }
      reason = promptValue.trim() || reason;
    }

    this.standsService
      .releaseStandBuyerLink(this.standId, link.id, { reason })
      .subscribe({
        next: () => {
          this.refreshBuyerData();
        },
        error: () => {
          alert('Unable to release the buyer link right now.');
        }
      });
  }

  protected formatDate(value?: string | null): string {
    if (!value) {
      return '—';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? '—'
      : date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
  }

  private fetchStand(): void {
    if (!this.standId) {
      return;
    }

    this.loadingStand = true;
    this.standError = null;
    this.standsService
      .getStandById(this.standId)
      .pipe(finalize(() => (this.loadingStand = false)))
      .subscribe({
        next: (stand) => {
          this.stand = stand;
        },
        error: () => {
          this.standError = 'Unable to load stand details.';
        }
      });
  }

  private refreshBuyerData(): void {
    this.loadBuyers();
    this.loadBuyerLinks();
  }

  private loadBuyers(): void {
    if (!this.standId) {
      return;
    }

    this.loadingBuyers = true;
    this.standsService
      .getStandBuyers<Buyer>(this.standId)
      .pipe(finalize(() => (this.loadingBuyers = false)))
      .subscribe({
        next: (buyers) => {
          this.buyers = buyers;
        },
        error: () => {
          this.buyers = [];
        }
      });
  }

  private loadBuyerLinks(): void {
    if (!this.standId) {
      return;
    }

    this.loadingBuyerLinks = true;
    this.standsService
      .getStandBuyerLinks<StandBuyerLink>(this.standId)
      .pipe(finalize(() => (this.loadingBuyerLinks = false)))
      .subscribe({
        next: (links) => {
          this.buyerLinks = links;
        },
        error: () => {
          this.buyerLinks = [];
        }
      });
  }

  private validateAddBuyerForm(): boolean {
    return (
      !!this.addBuyerForm.firstName.trim() &&
      !!this.addBuyerForm.lastName.trim() &&
      !!this.addBuyerForm.email.trim() &&
      !!this.addBuyerForm.phoneNumber.trim()
    );
  }

  private buildAddBuyerPayload(): Record<string, unknown> | null {
    if (!this.validateAddBuyerForm()) {
      return null;
    }

    const fullName =
      `${this.addBuyerForm.firstName.trim()} ${this.addBuyerForm.lastName.trim()}`.trim();

    return {
      fullName,
      email: this.addBuyerForm.email.trim(),
      phoneNumber: this.addBuyerForm.phoneNumber.trim(),
      nationalIdentityNumber: this.addBuyerForm.nationalIdentityNumber.trim() || null,
      notes: this.addBuyerForm.notes.trim() || null
    };
  }

  private buildLinkBuyerPayload(): Record<string, unknown> | null {
    const buyerUserId = this.linkBuyerForm.buyerUserId.trim();

    if (!buyerUserId) {
      return null;
    }

    const payload: Record<string, unknown> = { buyerUserId };

    if (this.linkBuyerForm.notes.trim()) {
      payload['notes'] = this.linkBuyerForm.notes.trim();
    }

    return payload;
  }

  private buildDefaultAddBuyerForm(): AddBuyerForm {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      nationalIdentityNumber: '',
      notes: ''
    };
  }

  private buildDefaultLinkBuyerForm(): LinkBuyerForm {
    return {
      buyerUserId: '',
      notes: ''
    };
  }
}

