import { CommonModule, NgClass, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgClass, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(private readonly router: Router) {}

  protected isUserMenuOpen = false;

  protected readonly sidebarNav: SidebarNavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', active: true, route: 'dashboard' },
    { label: 'Stands', icon: 'stands', badge: '12' },
    { label: 'Buyers', icon: 'buyers' },
    { label: 'Payments', icon: 'payments', badge: '4' },
    { label: 'Reports', icon: 'reports' },
    { label: 'Map', icon: 'map', route: 'map' },
    { label: 'Settings', icon: 'settings' },
  ];

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

  protected handleSidebarNavClick(item: SidebarNavItem): void {
    if (!item.route) {
      return;
    }

    this.router.navigate(['/', item.route]);
  }

  protected handleLogout(): void {
    this.isUserMenuOpen = false;
    this.router.navigate(['/auth/login']);
  }

  protected handleSettings(): void {
    this.isUserMenuOpen = false;
    this.router.navigate(['/settings']);
  }

  protected toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  @HostListener('document:click')
  protected handleDocumentClick(): void {
    if (!this.isUserMenuOpen) {
      return;
    }

    this.isUserMenuOpen = false;
  }
}


