import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Stand } from '../../../core/models/stand.model';
import { StandsService } from '../../../core/services/stands.service';

type SingleStandForm = {
  name: string;
  standNumber: string;
  type: string;
  price: number | null;
  size: number | null;
  location: string;
  status: string;
  description: string;
};

type SidebarNavItem = {
  label: string;
  icon: string;
  route?: string;
  badge?: string;
};

type BulkStandPayload = {
  name: string;
  standNumber: string;
  type?: string;
  price?: number;
  size?: number;
  location?: string;
  status?: string;
  description?: string;
};

@Component({
  selector: 'app-add-stand',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-stand.component.html',
  styleUrls: ['./add-stand.component.css']
})
export class AddStandComponent implements OnInit {
  @ViewChild('bulkFileInput', { static: false }) private bulkFileInputRef?: ElementRef<HTMLInputElement>;

  protected singleStandForm: SingleStandForm = this.buildDefaultSingleStandForm();
  protected singleStandSubmitting = false;
  protected singleStandError: string | null = null;
  protected singleStandSuccess: string | null = null;
  protected readonly sidebarNav: SidebarNavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: 'dashboard' },
    { label: 'Stands', icon: 'stands', route: 'stands' },
    { label: 'Buyers', icon: 'buyers' },
    { label: 'Payments', icon: 'payments', badge: '4' },
    { label: 'Reports', icon: 'reports' },
    { label: 'Map', icon: 'map', route: 'map' },
    { label: 'Settings', icon: 'settings', route: 'settings' }
  ];
  protected availableStandsCount = 0;
  protected bulkUploading = false;
  protected bulkUploadError: string | null = null;
  protected bulkUploadSuccess: string | null = null;
  protected bulkUploadCount = 0;
  protected selectedBulkFileName: string | null = null;
  private bulkFile: File | null = null;
  private readonly maxBulkFileSizeBytes = 5 * 1024 * 1024; // 5MB

  constructor(
    private readonly standsService: StandsService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadAvailableStandsCount();
  }

  protected handleSingleStandSubmit(event: Event): void {
    event.preventDefault();

    const payload = this.buildSingleStandPayload();

    if (!payload) {
      this.singleStandError = 'Please fill in all required stand details.';
      this.singleStandSuccess = null;
      return;
    }

    this.singleStandSubmitting = true;
    this.singleStandError = null;
    this.singleStandSuccess = null;

    this.standsService
      .createStand(payload)
      .pipe(finalize(() => (this.singleStandSubmitting = false)))
      .subscribe({
        next: (stand) => {
          this.singleStandSuccess = `Stand ${stand.standNumber || stand.name} added successfully.`;
          this.singleStandForm = this.buildDefaultSingleStandForm();
          this.router.navigate(['/stands']);
        },
        error: () => {
          this.singleStandError = 'Failed to create stand. Please try again.';
        }
      });
  }

  protected handleSidebarNavClick(item: SidebarNavItem): void {
    if (!item.route) {
      return;
    }

    this.router.navigate(['/', item.route]);
  }

  protected isNavItemActive(item: SidebarNavItem): boolean {
    if (!item.route) {
      return false;
    }

    const normalizedRoute = item.route.startsWith('/') ? item.route : `/${item.route}`;

    return this.router.url.startsWith(normalizedRoute);
  }

  protected handleBulkFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.bulkUploadError = null;
    this.bulkUploadSuccess = null;
    this.bulkUploadCount = 0;

    if (!file) {
      this.bulkFile = null;
      this.selectedBulkFileName = null;
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.bulkUploadError = 'Please select a CSV file (.csv) to continue.';
      input.value = '';
      this.bulkFile = null;
      this.selectedBulkFileName = null;
      return;
    }

    if (file.size > this.maxBulkFileSizeBytes) {
      this.bulkUploadError = 'CSV file is too large. Please choose a file smaller than 5MB.';
      input.value = '';
      this.bulkFile = null;
      this.selectedBulkFileName = null;
      return;
    }

    this.bulkFile = file;
    this.selectedBulkFileName = file.name;
  }

  protected resetBulkUpload(): void {
    this.bulkFile = null;
    this.selectedBulkFileName = null;
    this.bulkUploadError = null;
    this.bulkUploadSuccess = null;
    this.bulkUploadCount = 0;

    if (this.bulkFileInputRef?.nativeElement) {
      this.bulkFileInputRef.nativeElement.value = '';
    }
  }

  protected async handleBulkUpload(): Promise<void> {
    if (!this.bulkFile) {
      this.bulkUploadError = 'Select a CSV file before uploading.';
      this.bulkUploadSuccess = null;
      return;
    }

    this.bulkUploading = true;
    this.bulkUploadError = null;
    this.bulkUploadSuccess = null;

    try {
      const payload = await this.parseCsvFile(this.bulkFile);

      if (!payload.length) {
        throw new Error('No valid rows were found in the CSV file.');
      }

      this.bulkUploadCount = payload.length;

      this.standsService
        .bulkCreateStands({ stands: payload })
        .pipe(finalize(() => (this.bulkUploading = false)))
        .subscribe({
          next: () => {
            const noun = this.bulkUploadCount === 1 ? 'stand' : 'stands';
            const successMessage = `Uploaded ${this.bulkUploadCount} ${noun} successfully.`;
            this.resetBulkUpload();
            this.bulkUploadSuccess = successMessage;
          },
          error: () => {
            this.bulkUploadError = 'Bulk upload failed. Please try again.';
          }
        });
    } catch (error) {
      this.bulkUploading = false;
      this.bulkUploadError =
        error instanceof Error ? error.message : 'Unable to read the CSV file. Please try another file.';
    }
  }

  protected handleCancel(): void {
    this.router.navigate(['/stands']);
  }

  protected handleLogout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sms_auth_token');
      localStorage.removeItem('sms_user_profile');
    }

    this.router.navigate(['/auth/login']);
  }

  private buildDefaultSingleStandForm(): SingleStandForm {
    return {
      name: '',
      standNumber: '',
      type: '',
      price: null,
      size: null,
      location: '',
      status: 'available',
      description: ''
    };
  }

  private buildSingleStandPayload(): Record<string, unknown> | null {
    const name = this.singleStandForm.name.trim();
    const standNumber = this.singleStandForm.standNumber.trim();
    const type = this.singleStandForm.type.trim();

    if (
      this.singleStandForm.price === null ||
      this.singleStandForm.size === null ||
      Number.isNaN(Number(this.singleStandForm.price)) ||
      Number.isNaN(Number(this.singleStandForm.size))
    ) {
      return null;
    }

    const price = Number(this.singleStandForm.price);
    const size = Number(this.singleStandForm.size);
    const location = this.singleStandForm.location.trim();
    const status = this.singleStandForm.status.trim() || 'available';
    const description = this.singleStandForm.description.trim();

    if (!name || !standNumber || !type || Number.isNaN(price) || Number.isNaN(size) || !location || !status) {
      return null;
    }

    return {
      name,
      standNumber,
      type,
      price,
      size,
      location,
      status,
      description
    };
  }

  private loadAvailableStandsCount(): void {
    this.standsService.getStands().subscribe({
      next: (stands: Stand[]) => {
        this.availableStandsCount = stands.filter(
          (stand) => (stand.status ?? '').toLowerCase() === 'available'
        ).length;
      },
      error: () => {
        this.availableStandsCount = 0;
      }
    });
  }

  private async parseCsvFile(file: File): Promise<BulkStandPayload[]> {
    const text = await file.text();
    const normalizedText = text.trim();

    if (!normalizedText) {
      throw new Error('The CSV file is empty.');
    }

    const rows = normalizedText.split(/\r?\n/).filter((line) => line.trim().length);

    if (rows.length < 2) {
      throw new Error('The CSV file must include a header row and at least one data row.');
    }

    const headers = this.splitCsvLine(rows[0]).map((header) => header.trim().toLowerCase());
    const payload: BulkStandPayload[] = [];

    for (const row of rows.slice(1)) {
      const values = this.splitCsvLine(row);
      const record: Record<string, string> = {};

      headers.forEach((header, index) => {
        record[header] = values[index]?.trim() ?? '';
      });

      const normalized = this.normalizeCsvRecord(record);

      if (normalized.name && normalized.standNumber) {
        payload.push(normalized);
      }
    }

    return payload;
  }

  private splitCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }

        continue;
      }

      if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
        continue;
      }

      current += char;
    }

    result.push(current);

    return result;
  }

  private normalizeCsvRecord(record: Record<string, string>): BulkStandPayload {
    const getValue = (...keys: string[]): string => {
      for (const key of keys) {
        if (record[key]) {
          return record[key];
        }
      }

      return '';
    };

    const toNumber = (value: string): number | undefined => {
      if (!value) {
        return undefined;
      }

      const parsed = Number(value.replace(/,/g, ''));

      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const status = getValue('status') || 'available';

    const payload: BulkStandPayload = {
      name: getValue('name', 'stand name'),
      standNumber: getValue('standnumber', 'stand number', 'number', 'id'),
      type: getValue('type', 'stand type'),
      price: toNumber(getValue('price')),
      size: toNumber(getValue('size', 'stand size')),
      location: getValue('location', 'stand location'),
      status: status.toLowerCase(),
      description: getValue('description', 'details')
    };

    if (payload.price === undefined) {
      delete payload.price;
    }

    if (payload.size === undefined) {
      delete payload.size;
    }

    if (!payload.status) {
      payload.status = 'available';
    }

    return payload;
  }
}


