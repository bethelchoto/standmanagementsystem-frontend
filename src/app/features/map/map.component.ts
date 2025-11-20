import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {
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

  protected activeStateId = this.mapStates[0].id;

  protected readonly mapSummaryStats = [
    { label: 'Customers', value: '968' },
    { label: 'Orders', value: '1.8k' },
    { label: 'Stock Left', value: '30k' },
    { label: 'Pending', value: '1.7k' }
  ];

  protected readonly keyInsights = [
    { label: 'Total Stands', value: '1,730', helper: 'Active across all sites' },
    { label: 'Avg. Occupancy', value: '88%', helper: 'Goal 90%' },
    { label: 'Net Revenue', value: '$168.9K', helper: 'This month' }
  ];

  protected selectState(state: MapState): void {
    this.activeStateId = state.id;
  }

  protected isActive(state: MapState): boolean {
    return state.id === this.activeStateId;
  }

  protected get activeState(): MapState {
    return this.mapStates.find((state) => state.id === this.activeStateId) ?? this.mapStates[0];
  }
}

