import { CommonModule, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

type MetricCard = {
  label: string;
  value: string;
  helper: string;
  delta: string;
  deltaType: 'positive' | 'negative' | 'neutral';
  sparkline: number[];
};

type Transaction = {
  name: string;
  stand: string;
  date: string;
  status: 'Confirmed' | 'Pending' | 'Rejected';
};

type FeedItem = {
  title: string;
  author: string;
  timeAgo: string;
  tag: string;
};

type Project = {
  name: string;
  progress: number;
  owner: string;
  due: string;
};

type MapState = {
  id: string;
  label: string;
  stands: number;
  percent: string;
  delta: string;
  color: string;
  path: string;
  centroid: { x: number; y: number };
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
  imports: [CommonModule, NgSwitch, NgSwitchCase, NgSwitchDefault],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(private readonly router: Router) {}

  protected readonly sidebarNav: SidebarNavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', active: true, route: 'dashboard' },
    { label: 'Stands', icon: 'stands', badge: '12' },
    { label: 'Buyers', icon: 'buyers' },
    { label: 'Transactions', icon: 'transactions', badge: '4' },
    { label: 'Reports', icon: 'reports' },
    { label: 'Map', icon: 'map', route: 'map' },
    { label: 'Settings', icon: 'settings' },
    { label: 'Support', icon: 'support' }
  ];

  protected readonly metricCards: MetricCard[] = [
    {
      label: 'This Month',
      value: '$168.9K',
      helper: 'Net Revenue',
      delta: '+18.2%',
      deltaType: 'positive',
      sparkline: [45, 60, 55, 72, 64, 78, 90]
    },
    {
      label: 'Active Stands',
      value: '1,730',
      helper: 'Across 42 sites',
      delta: '+77 new',
      deltaType: 'positive',
      sparkline: [30, 32, 34, 36, 40, 42, 44]
    },
    {
      label: 'Occupancy',
      value: '88%',
      helper: 'Company-wide',
      delta: '-3% vs. target',
      deltaType: 'neutral',
      sparkline: [85, 86, 84, 83, 87, 90, 88]
    },
    {
      label: 'Pending Actions',
      value: '27',
      helper: 'Assignments to review',
      delta: '+5 escalations',
      deltaType: 'negative',
      sparkline: [10, 12, 14, 17, 20, 23, 27]
    }
  ];

  // protected readonly quarterSummary = {
  //   title: 'This Quarter',
  //   amount: '$3,936.80',
  //   online: 70,
  //   offline: 30,
  //   customers: 968,
  //   orders: 1800,
  //   inventory: 30000,
  //   pending: 1.7
  // };

  protected readonly mapOutlinePath =
    'M90 260 L130 210 L190 185 L260 165 L330 150 L420 150 L480 180 L540 195 L600 215 L660 235 L700 255 L684 300 L636 330 L580 338 L520 360 L460 360 L400 348 L340 360 L280 342 L220 320 L170 302 L120 280 Z';

  protected readonly mapStates: MapState[] = [
    {
      id: 'texas',
      label: 'Texas',
      stands: 352,
      percent: '25%',
      delta: '+12%',
      color: '#2563eb',
      path: 'M330 260 L390 260 L430 290 L420 330 L370 330 L340 300 Z',
      centroid: { x: 380, y: 295 }
    },
    {
      id: 'utah',
      label: 'Utah',
      stands: 118,
      percent: '45%',
      delta: '+8%',
      color: '#7c3aed',
      path: 'M240 210 L280 210 L280 260 L240 260 Z',
      centroid: { x: 260, y: 235 }
    },
    {
      id: 'nebraska',
      label: 'Nebraska',
      stands: 64,
      percent: '15%',
      delta: '+2%',
      color: '#2dd4bf',
      path: 'M300 180 L380 180 L380 215 L300 215 Z',
      centroid: { x: 340, y: 195 }
    },
    {
      id: 'georgia',
      label: 'Georgia',
      stands: 82,
      percent: '10%',
      delta: '+5%',
      color: '#22c55e',
      path: 'M520 240 L550 240 L565 280 L540 310 L510 285 Z',
      centroid: { x: 535, y: 275 }
    }
  ];

  protected readonly mapSummaryStats = [
    { label: 'Customers', value: '968' },
    { label: 'Orders', value: '1.8k' },
    { label: 'Stock Left', value: '30k' },
    { label: 'Pending', value: '1.7k' }
  ];

  protected readonly allocationBreakdown = [
    { state: 'Texas', percent: 35, color: '#2563eb' },
    { state: 'Utah', percent: 25, color: '#7c3aed' },
    { state: 'Georgia', percent: 20, color: '#22c55e' },
    { state: 'Nebraska', percent: 12, color: '#2dd4bf' },
    { state: 'Other', percent: 8, color: '#94a3b8' }
  ];

  protected readonly monthlyOverview = {
    stats: [
      { label: 'Avg. Ticket', value: '$1,730' },
      { label: 'Increment', value: '77%' },
      { label: 'Net Profit', value: '18%' }
    ],
    labels: ['15th', '16th', '17th', '18th', '19th', '20th', '21st'],
    series: [
      { name: 'Revenue', color: '#22c55e', points: [60, 72, 68, 80, 76, 88, 92] },
      { name: 'Occupancy', color: '#3b82f6', points: [48, 55, 52, 60, 57, 63, 70] }
    ]
  };

  protected readonly latestTransactions: Transaction[] = [
    { name: 'Jordan Hunt', stand: 'A-112', date: '08 May', status: 'Confirmed' },
    { name: 'Sarnel Field', stand: 'B-208', date: '08 May', status: 'Pending' },
    { name: 'Jennifer Watkins', stand: 'C-145', date: '08 May', status: 'Confirmed' },
    { name: 'Michael Birch', stand: 'D-067', date: '08 May', status: 'Rejected' },
    { name: 'Jordan Hunt', stand: 'A-113', date: '08 May', status: 'Pending' }
  ];

  protected readonly liveFeed: FeedItem[] = [
    { title: 'Buyer presentation uploaded', author: 'Jordan Hunt', timeAgo: 'just now', tag: 'Docs' },
    { title: 'Payment plan updated for Riverside Mall', author: 'Team Finance', timeAgo: '12m ago', tag: 'Billing' },
    { title: 'New buyer inquiry assigned to you', author: 'Automation', timeAgo: '45m ago', tag: 'Lead' }
  ];

  protected readonly projects: Project[] = [
    { name: 'Downtown Expansion', progress: 78, owner: 'Amelia West', due: 'Jul 20' },
    { name: 'Seasonal Pop-ups', progress: 45, owner: 'Marcus Cole', due: 'Aug 02' },
    { name: 'Buyer Portal Refresh', progress: 62, owner: 'UX Guild', due: 'Aug 15' }
  ];

  protected readonly functionalRequirements = [
    'Admin users manage stands, buyers, reports, and company users end-to-end.',
    'General users manage stands and buyers within their assigned scope.',
    'Both roles can add stands, update details, and toggle availability.',
    'Reporting respects access level (full vs. scoped).',
    'Stand access is automatically scoped per role and owner.',
    'Buyers and transactions inherit permissions from their parent stand.'
  ];

  protected readonly allocationGradient = this.buildAllocationGradient(this.allocationBreakdown);

  protected getSparkHeight(value: number): string {
    return `${value}%`;
  }

  protected buildPolyline(points: number[]): string {
    if (!points.length) {
      return '';
    }

    const step = 100 / Math.max(points.length - 1, 1);

    return points
      .map((value, index) => `${(index * step).toFixed(2)},${(100 - value).toFixed(2)}`)
      .join(' ');
  }

  protected getChartX(index: number, total: number): number {
    if (total <= 1) {
      return 0;
    }

    return (index / (total - 1)) * 100;
  }

  protected getChartY(value: number): number {
    return 100 - value;
  }

  private buildAllocationGradient(breakdown: typeof this.allocationBreakdown): string {
    let cursor = 0;

    return breakdown
      .map((entry) => {
        const start = cursor;
        cursor += entry.percent;
        return `${entry.color} ${start}% ${cursor}%`;
      })
      .join(', ');
  }

  protected handleSidebarNavClick(item: SidebarNavItem): void {
    if (!item.route) {
      return;
    }

    this.router.navigate(['/', item.route]);
  }
}


