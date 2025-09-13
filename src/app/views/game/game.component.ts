import { trigger, style, transition, animate } from '@angular/animations';

export const slideInAnimation = trigger('slideIn', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('0.5s ease-in-out', style({ transform: 'translateX(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('0.5s ease-in-out', style({ transform: 'translateX(100%)', opacity: 0 }))
  ])
]);

import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { CultivosComponent } from '../../shared/components/cultivos/cultivos.component';
import { RiegosComponent } from '../../shared/components/riegos/riegos.component';
import { GanaderiaComponent } from '../../shared/components/ganaderia/ganaderia.component';
import { InvestigacionComponent } from '../../shared/components/investigacion/investigacion.component';

interface Resource {
  type: 'water' | 'energy' | 'biomass' | 'research';
  value: string;
  icon: string;
}

interface SatelliteData {
  soilHumidity: number;
  vegetationIndex: number;
  soilTemperature: number;
  precipitation: number;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  pressure: number;
}

interface CropInfo {
  type: string;
  growth: number;
  health: string;
  daysToHarvest: number;
  estimatedYield: number;
}

interface FarmPlot {
  id: number;
  planted: boolean;
  irrigated: boolean;
  cropIcon: string;
}
@Component({
  selector: 'app-game',
  imports: [ CommonModule, CultivosComponent, RiegosComponent,
     GanaderiaComponent, InvestigacionComponent
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  animations: [slideInAnimation]
})
export class GameComponent  implements OnInit, OnDestroy {
  title = 'SpaceFarm';
  
  resources: Resource[] = [
    { type: 'water', value: '1,250 L', icon: 'water' },
    { type: 'energy', value: '850 kW', icon: 'energy' },
    { type: 'biomass', value: '2,100 kg', icon: 'biomass' },
    { type: 'research', value: '45 pts', icon: 'research' }
  ];

  satelliteData: SatelliteData = {
    soilHumidity: 78,
    vegetationIndex: 0.65,
    soilTemperature: 22,
    precipitation: 12
  };

  weatherData: WeatherData = {
    temperature: 24,
    humidity: 68,
    windSpeed: 12,
    uvIndex: 6.2,
    pressure: 1013
  };

  cropInfo: CropInfo = {
    type: 'Tomate',
    growth: 75,
    health: 'Excelente',
    daysToHarvest: 12,
    estimatedYield: 2.3
  };

  farmPlots: FarmPlot[] = [];
  notification: string = 'Riego automático activado en Sector B';
  showNotification: boolean = true;

  private humiditySubscription?: Subscription;

  ngOnInit() {
    this.initializeFarmPlots();
    this.startHumiditySimulation();
    
    // Ocultar notificación después de 3 segundos
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  ngOnDestroy() {
    if (this.humiditySubscription) {
      this.humiditySubscription.unsubscribe();
    }
  }

  initializeFarmPlots() {
    const plotConfigurations = [
      { planted: true, irrigated: true, cropIcon: '🌱' },
      { planted: true, irrigated: false, cropIcon: '🌾' },
      { planted: false, irrigated: false, cropIcon: '' },
      { planted: true, irrigated: false, cropIcon: '🥕' },
      { planted: false, irrigated: true, cropIcon: '' },
      { planted: true, irrigated: true, cropIcon: '🌽' },
      { planted: false, irrigated: false, cropIcon: '' },
      { planted: true, irrigated: false, cropIcon: '🥬' },
      
      { planted: false, irrigated: false, cropIcon: '' },
      { planted: true, irrigated: true, cropIcon: '🍅' },
      { planted: true, irrigated: false, cropIcon: '🌱' },
      { planted: false, irrigated: false, cropIcon: '' },
      { planted: true, irrigated: false, cropIcon: '🥔' },
      { planted: false, irrigated: true, cropIcon: '' },
      { planted: false, irrigated: false, cropIcon: '' },
      { planted: true, irrigated: false, cropIcon: '🌾' },
      
      { planted: true, irrigated: false, cropIcon: '🥕' },
      { planted: false, irrigated: false, cropIcon: '' },
      { planted: false, irrigated: true, cropIcon: '' },
      { planted: true, irrigated: true, cropIcon: '🌽' },
      { planted: false, irrigated: false, cropIcon: '' },
      { planted: true, irrigated: false, cropIcon: '🥬' },
      { planted: true, irrigated: false, cropIcon: '🍅' },
      { planted: false, irrigated: false, cropIcon: '' },
      
      { planted: false, irrigated: false, cropIcon: '' },
      { planted: true, irrigated: false, cropIcon: '🌱' },
      { planted: true, irrigated: true, cropIcon: '🥔' },
      { planted: false, irrigated: false, cropIcon: '' },
      { planted: true, irrigated: false, cropIcon: '🌾' },
      { planted: false, irrigated: true, cropIcon: '' },
      { planted: false, irrigated: false, cropIcon: '' },
      { planted: true, irrigated: false, cropIcon: '🥕' },
      
      { planted: true, irrigated: false, cropIcon: '🌽' },
      { planted: false, irrigated: false, cropIcon: '' },
      { planted: true, irrigated: true, cropIcon: '🥬' },
      { planted: true, irrigated: false, cropIcon: '🍅' },
      { planted: false, irrigated: false, cropIcon: '' },
      { planted: false, irrigated: true, cropIcon: '' },
      { planted: true, irrigated: false, cropIcon: '🌱' },
      { planted: false, irrigated: false, cropIcon: '' },
      
      { planted: false, irrigated: false, cropIcon: '' },
      { planted: true, irrigated: false, cropIcon: '🥔' },
      { planted: true, irrigated: false, cropIcon: '🌾' },
      { planted: false, irrigated: true, cropIcon: '' },
      { planted: true, irrigated: true, cropIcon: '🥕' },
      { planted: false, irrigated: false, cropIcon: '' },
      { planted: true, irrigated: false, cropIcon: '🌽' },
      { planted: true, irrigated: false, cropIcon: '🥬' }
    ];

    this.farmPlots = plotConfigurations.map((config, index) => ({
      id: index,
      ...config
    }));
  }

  startHumiditySimulation() {
    this.humiditySubscription = interval(5000).subscribe(() => {
      const change = Math.floor(Math.random() * 6) - 3;
      this.satelliteData.soilHumidity = Math.max(0, Math.min(100, this.satelliteData.soilHumidity + change));
    });
  }

  onPlotClick(plot: FarmPlot) {
    if (!plot.planted) {
      plot.planted = true;
      plot.cropIcon = '🌱';
      
      this.notification = '🌱 Semilla plantada exitosamente';
      this.showNotification = true;
      
      setTimeout(() => {
        this.showNotification = false;
      }, 3000);
    }
  }

  onActionClick(action: string) {
    // Simular efecto de click
    console.log(`Acción ejecutada: ${action}`);
    
    // Aquí puedes agregar la lógica específica para cada acción
    this.notification = `✅ ${action} ejecutado`;
    this.showNotification = true;
    
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  getResourceIconClass(type: string): string {
    return `resource-icon ${type}`;
  }

  getPlotClasses(plot: FarmPlot): string {
    let classes = 'farm-plot';
    if (plot.planted) classes += ' planted';
    if (plot.irrigated) classes += ' irrigated';
    return classes;
  }
}