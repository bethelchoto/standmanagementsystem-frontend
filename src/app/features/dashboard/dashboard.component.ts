import { CommonModule, NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, finalize } from 'rxjs/operators';
import { UpdateProfileModalComponent } from './update-profile-modal/update-profile-modal.component';
import { UserProfile } from '../../core/models/user-profile.model';
import { UserProfileService } from '../../core/services/user-profile.service';
import { StandsService } from '../../core/services/stands.service';
import { Stand } from '../../core/models/stand.model';
import * as XLSX from 'xlsx';

type SummaryCard = {
  label: string;
  value: string;
  helper: string;
  accent: 'sunset' | 'citrus' | 'mint' | 'lavender';
};

type RevenuePoint = {
  label: string;
  online: number;
  offline: number;
};

type VisitorSeries = {
  name: string;
  color: string;
  points: number[];
};

type TargetRealityStat = {
  label: string;
  reality: number;
  target: number;
};

type Product = {
  rank: number;
  name: string;
  sales: string;
  popularity: number;
  color: string;
};

type RegionBreakdown = {
  name: string;
  stands: number;
  percent: string;
  color: string;
  position: { x: number; y: number };
};

type ServiceMix = {
  label: string;
  value: number;
  color: string;
};

type SidebarNavItem = {
  label: string;
  icon: string;
  badge?: string;
  active?: boolean;
  route?: string;
};

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

type StandPayload = {
  name?: string;
  standNumber?: string;
  type?: string;
  price?: number | null;
  size?: number | null;
  location?: string;
  status?: string;
  description?: string;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgClass,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    UpdateProfileModalComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  constructor(
    private readonly router: Router,
    private readonly userProfileService: UserProfileService,
    private readonly standsService: StandsService
  ) {
    this.userProfile = this.loadUserProfile();
  }

  @ViewChild('profileMenu', { static: false }) private profileMenuRef?: ElementRef<HTMLElement>;
  @ViewChild('bulkFileInput', { static: false }) private bulkFileInputRef?: ElementRef<HTMLInputElement>;

  protected activeView: 'dashboard' | 'settings' | 'map' | 'stands' = 'dashboard';
  protected isUserMenuOpen = false;
  protected isUpdateProfileModalOpen = signal(false);
  protected stands = signal<Stand[]>([]);
  protected loadingStands = signal(false);
  protected availableStandsCount = signal(0);
  protected standSearchTerm = '';
  protected searchingStand = false;
  protected standSearchError: string | null = null;
  protected standSearchResult: Stand | null = null;
  protected isAddStandModalOpen = signal(false);
  protected addStandMode: 'single' | 'bulk' = 'single';
  protected singleStandForm = this.buildDefaultSingleStandForm();
  protected singleStandSubmitting = false;
  protected singleStandError: string | null = null;
  protected singleStandSuccess: string | null = null;
  protected bulkUploading = false;
  protected bulkUploadError: string | null = null;
  protected bulkUploadSuccess: string | null = null;
  protected bulkUploadCount = 0;
  private routerSubscription?: Subscription;
  private bulkUploadFile?: File;

  protected readonly sidebarNav: SidebarNavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', active: true, route: 'dashboard' },
    { label: 'Stands', icon: 'stands', route: 'stands' },
    { label: 'Buyers', icon: 'buyers', route: 'buyers' },
    { label: 'Payments', icon: 'payments', badge: '4' },
    { label: 'Reports', icon: 'reports' },
    { label: 'Map', icon: 'map', route: 'map' },
    { label: 'Settings', icon: 'settings', route: 'settings' },
  ];

  protected userProfile!: UserProfile;

  protected readonly salesSummaryCards: SummaryCard[] = [
    { label: 'Total Sales', value: '$1k', helper: '+15% from yesterday', accent: 'sunset' },
    { label: 'Total Orders', value: '300', helper: '+8% from yesterday', accent: 'citrus' },
    { label: 'Product Sold', value: '5', helper: '+12% from yesterday', accent: 'mint' },
    { label: 'New Customers', value: '8', helper: '+0.8% from yesterday', accent: 'lavender' }
  ];

  protected readonly revenueTrend: RevenuePoint[] = [
    { label: 'Mon', online: 18, offline: 12 },
    { label: 'Tue', online: 20, offline: 14 },
    { label: 'Wed', online: 22, offline: 15 },
    { label: 'Thu', online: 25, offline: 17 },
    { label: 'Fri', online: 28, offline: 18 },
    { label: 'Sat', online: 24, offline: 16 },
    { label: 'Sun', online: 21, offline: 15 }
  ];

  protected readonly visitorInsights = {
    series: [
      { name: 'Loyal Customers', color: '#f472b6', points: [60, 68, 62, 74, 70, 82, 78, 85, 80, 88, 81, 90] },
      { name: 'New Customers', color: '#22d3ee', points: [35, 42, 38, 50, 44, 58, 55, 60, 57, 62, 64, 70] },
      { name: 'Unique Customers', color: '#8b5cf6', points: [48, 52, 50, 56, 54, 60, 59, 64, 62, 68, 66, 72] }
    ]
  };

  protected readonly customerSatisfaction = [60, 64, 63, 67, 70, 69, 74, 72, 76, 78];

  protected readonly targetRealityStats: TargetRealityStat[] = [
    { label: 'Reality Sales', reality: 8823, target: 11232 },
    { label: 'Target Sales', reality: 6300, target: 9500 },
    { label: 'Net Profit', reality: 4132, target: 5200 }
  ];

  protected readonly topProducts: Product[] = [
    { rank: 1, name: 'Home Décor Range', sales: '$1k sales', popularity: 65, color: 'linear-gradient(90deg,#60a5fa,#a855f7)' },
    { rank: 2, name: 'Disney Princess Pink Bag 18"', sales: '$658 sales', popularity: 28, color: 'linear-gradient(90deg,#fb7185,#fbbf24)' },
    { rank: 3, name: 'Bathroom Essentials', sales: '$402 sales', popularity: 18, color: 'linear-gradient(90deg,#34d399,#22d3ee)' },
    { rank: 4, name: 'Apple Smartwatches', sales: '$352 sales', popularity: 25, color: 'linear-gradient(90deg,#c084fc,#a5b4fc)' }
  ];

  protected readonly regionBreakdown: RegionBreakdown[] = [
    { name: 'USA', stands: 312, percent: '35%', color: '#6366f1', position: { x: 38, y: 55 } },
    { name: 'Canada', stands: 174, percent: '18%', color: '#22d3ee', position: { x: 32, y: 32 } },
    { name: 'Brazil', stands: 120, percent: '12%', color: '#f97316', position: { x: 45, y: 85 } },
    { name: 'India', stands: 205, percent: '22%', color: '#10b981', position: { x: 68, y: 58 } }
  ];

  protected readonly serviceMix: ServiceMix[] = [
    { label: 'Volume', value: 105, color: '#60a5fa' },
    { label: 'Services', value: 95, color: '#34d399' }
  ];

  private readonly revenuePeak = Math.max(...this.revenueTrend.flatMap((point) => [point.online, point.offline]));
  private readonly targetPeak = Math.max(...this.targetRealityStats.flatMap((stat) => [stat.reality, stat.target]));
  private readonly servicePeak = Math.max(...this.serviceMix.map((service) => service.value));

  protected get userInitials(): string {
    return this.buildUserInitials(this.userProfile);
  }

  ngOnInit(): void {
    this.syncActiveViewWithRoute(this.router.url);

    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.syncActiveViewWithRoute(event.urlAfterRedirects);
        if (this.shouldLoadStandsForUrl(event.urlAfterRedirects)) {
          this.loadStands();
        }
      });

    if (this.shouldLoadStandsForUrl(this.router.url)) {
      this.loadStands();
    }
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  protected buildLinePoints(points: number[]): string {
    if (!points.length) {
      return '';
    }

    const step = 100 / Math.max(points.length - 1, 1);

    return points
      .map((value, index) => `${(index * step).toFixed(2)},${(100 - value).toFixed(2)}`)
      .join(' ');
  }

  protected getLineX(index: number, total: number): number {
    if (total <= 1) {
      return 0;
    }

    return (index / (total - 1)) * 100;
  }

  protected getLineY(value: number): number {
    return 100 - value;
  }

  protected getTrendHeight(value: number): string {
    if (!this.revenuePeak) {
      return '0%';
    }

    return `${(value / this.revenuePeak) * 100}%`;
  }

  protected getTargetWidth(value: number): string {
    if (!this.targetPeak) {
      return '0%';
    }

    return `${(value / this.targetPeak) * 100}%`;
  }

  protected getProgressWidth(value: number): string {
    return `${value}%`;
  }

  protected getServiceHeight(value: number): string {
    if (!this.servicePeak) {
      return '0%';
    }

    return `${(value / this.servicePeak) * 100}%`;
  }

  protected formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected handleSidebarNavClick(item: SidebarNavItem): void {
    if (!item.route) {
      return;
    }

    this.router.navigate(['/', item.route]);
  }

  protected isNavItemActive(item: SidebarNavItem): boolean {
    if (item.route) {
      const normalizedRoute = item.route.startsWith('/') ? item.route : `/${item.route}`;

      return this.router.url.startsWith(normalizedRoute);
    }

    return Boolean(item.active);
  }

  protected openDashboardView(): void {
    this.activeView = 'dashboard';
    this.router.navigate(['/dashboard']);
  }

  protected openSettingsView(): void {
    this.activeView = 'settings';
    this.router.navigate(['/settings']);
  }

  protected handleUpdateProfile(): void {
    this.isUpdateProfileModalOpen.set(true);
  }

  protected handleCloseUpdateProfileModal(): void {
    this.isUpdateProfileModalOpen.set(false);
  }

  protected handleProfileUpdated(): void {
    this.refreshUserProfile();
    console.info('Profile updated successfully');
  }

  protected handleLogout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sms_auth_token');
      localStorage.removeItem('sms_user_profile');
    }

    this.router.navigate(['/auth/login']);
  }

  protected toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  protected handleUserMenuSelect(action: 'settings' | 'logout'): void {
    this.isUserMenuOpen = false;

    if (action === 'settings') {
      this.openSettingsView();
      return;
    }

    this.handleLogout();
  }

  @HostListener('document:click', ['$event'])
  protected handleDocumentClick(event: MouseEvent): void {
    if (!this.isUserMenuOpen) {
      return;
    }

    if (this.profileMenuRef?.nativeElement.contains(event.target as Node)) {
      return;
    }

    this.isUserMenuOpen = false;
  }

  protected handleStandSearch(event?: Event): void {
    event?.preventDefault();
    const term = this.standSearchTerm.trim();

    if (!term) {
      this.standSearchError = 'Enter a stand ID to search.';
      this.standSearchResult = null;
      return;
    }

    this.searchingStand = true;
    this.standSearchError = null;
    this.standSearchResult = null;

    this.standsService
      .getStandById(term)
      .pipe(finalize(() => (this.searchingStand = false)))
      .subscribe({
        next: (stand) => {
          this.standSearchResult = stand;
        },
        error: (error) => {
          if (error?.status === 404) {
            this.standSearchError = 'Stand not found. Double-check the ID and try again.';
            return;
          }

          this.standSearchError = 'Unable to search for that stand right now.';
        }
      });
  }

  protected clearStandSearch(): void {
    this.standSearchTerm = '';
    this.standSearchResult = null;
    this.standSearchError = null;
  }

  protected goToAddStandPage(): void {
    this.router.navigate(['/add-stands']);
  }

  protected navigateToStandBuyers(stand: Stand): void {
    if (!stand?.id) {
      return;
    }

    this.router.navigate(['/stands', stand.id, 'buyers']);
  }

  protected handleStandCardKeypress(event: KeyboardEvent, stand: Stand): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    this.navigateToStandBuyers(stand);
  }

  private buildUserInitials(profile: UserProfile): string {
    const firstInitial = profile.firstName?.charAt(0) ?? '';
    const lastInitial = profile.lastName?.charAt(0) ?? '';
    const initials = `${firstInitial}${lastInitial}`.trim();

    return initials ? initials.toUpperCase() : 'NA';
  }

  private syncActiveViewWithRoute(url: string): void {
    if (url.includes('/settings')) {
      this.activeView = 'settings';
      return;
    }

    if (url.includes('/stands')) {
      this.activeView = 'stands';
      return;
    }

    if (url.includes('/map')) {
      this.activeView = 'map';
      return;
    }

    this.activeView = 'dashboard';
  }

  private filterAvailableStands(stands: Stand[]): Stand[] {
    return stands.filter((stand) => this.isStandAvailable(stand));
  }

  private shouldLoadStandsForUrl(url: string): boolean {
    return ['/map', '/stands', '/dashboard', '/settings'].some((segment) => url.includes(segment));
  }

  protected handleRefreshStands(): void {
    this.loadStands();
  }

  private loadStands(): void {
    this.loadingStands.set(true);
    this.standsService
      .getStands()
      .pipe(finalize(() => this.loadingStands.set(false)))
      .subscribe({
        next: (stands) => {
          this.stands.set(stands);
          this.availableStandsCount.set(this.filterAvailableStands(stands).length);
        },
        error: (error) => {
          console.error('Error loading stands:', error);
          this.stands.set([]);
          this.availableStandsCount.set(0);
        }
      });
  }

  protected isStandSold(stand: Stand): boolean {
    return stand.status?.toLowerCase() === 'sold';
  }

  protected isStandAvailable(stand: Stand): boolean {
    return stand.status?.toLowerCase() === 'available';
  }

  protected getStandNumber(stand: Stand): string | null {
    return stand.standNumber || null;
  }

  protected getAvailableStands(): Stand[] {
    return this.filterAvailableStands(this.stands());
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
      !this.hasNumericValue(this.singleStandForm.price) ||
      !this.hasNumericValue(this.singleStandForm.size)
    ) {
      return null;
    }

    const price = Number(this.singleStandForm.price);
    const size = Number(this.singleStandForm.size);
    const location = this.singleStandForm.location.trim();
    const status = this.singleStandForm.status.trim() || 'available';
    const description = this.singleStandForm.description.trim();

    if (
      !name ||
      !standNumber ||
      !type ||
      Number.isNaN(price) ||
      Number.isNaN(size) ||
      !location ||
      !status
    ) {
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

  private resetAddStandState(): void {
    this.singleStandForm = this.buildDefaultSingleStandForm();
    this.singleStandError = null;
    this.singleStandSuccess = null;
    this.singleStandSubmitting = false;
    this.bulkUploading = false;
    this.bulkUploadError = null;
    this.bulkUploadSuccess = null;
    this.bulkUploadCount = 0;
    this.bulkUploadFile = undefined;
    this.resetBulkFileInput();
  }

  private clearAddStandFeedback(): void {
    this.singleStandError = null;
    this.singleStandSuccess = null;
    this.bulkUploadError = null;
    this.bulkUploadSuccess = null;
  }

  private resetBulkFileInput(): void {
    if (this.bulkFileInputRef?.nativeElement) {
      this.bulkFileInputRef.nativeElement.value = '';
    }
  }

  private async parseSpreadsheet(file: File): Promise<StandPayload[]> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    if (!workbook.SheetNames.length) {
      throw new Error('No sheets were found in the uploaded file.');
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: '',
      raw: false,
      blankrows: false
    });

    return rows
      .map((row) => this.normalizeStandPayload(row))
      .filter((payload) => payload.name && payload.standNumber);
  }

  private normalizeStandPayload(row: Record<string, unknown>): StandPayload {
    const toNumber = (value: unknown): number | null => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const payload: StandPayload = {
      name: this.toTrimmedString(row['name']),
      standNumber: this.toTrimmedString(row['standNumber']),
      type: this.toTrimmedString(row['type']),
      price: toNumber(row['price']),
      size: toNumber(row['size']),
      location: this.toTrimmedString(row['location']),
      status: this.toTrimmedString(row['status']) || 'available',
      description: this.toTrimmedString(row['description'])
    };

    if (payload.price === null) {
      delete payload.price;
    }

    if (payload.size === null) {
      delete payload.size;
    }

    return payload;
  }

  private toTrimmedString(value: unknown): string {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (value === null || value === undefined) {
      return '';
    }

    return String(value).trim();
  }

  private hasNumericValue(value: unknown): boolean {
    if (value === null || value === undefined || value === '') {
      return false;
    }

    return !Number.isNaN(Number(value));
  }

  private loadUserProfile(): UserProfile {
    return this.userProfileService.getResolvedProfile() ?? this.buildFallbackUserProfile();
  }

  private buildFallbackUserProfile(): UserProfile {
    return {
      id: '34a86d54-bfa8-11f0-ac0c-5a387c688d6c',
      firstName: 'Tale',
      lastName: 'Mufundirwa',
      email: 'mufundirwaebenezert@gmail.com',
      phoneNumber: '+250789564612',
      role: 'general',
      emailVerified: true,
      createdAt: '2025-11-12T07:16:00.000Z',
      updatedAt: '2025-11-12T07:18:13.000Z',
      avatarUrl: 'https://i.pravatar.cc/160?img=5',
      nationalIdentityNumber: '70-2004605H38'
    };
  }

  private refreshUserProfile(): void {
    this.userProfile = this.loadUserProfile();
  }
}
