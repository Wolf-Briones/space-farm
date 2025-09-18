// game.component.ts (Actualizado)
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
import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { CultivosComponent } from '../../shared/components/cultivos/cultivos.component';
import { RiegosComponent } from '../../shared/components/riegos/riegos.component';
import { GanaderiaComponent } from '../../shared/components/ganaderia/ganaderia.component';
import { InvestigacionComponent } from '../../shared/components/investigacion/investigacion.component';
import { MiniEarthComponent } from '../../shared/components/mini-earth/mini-earth.component';

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

interface LocationData {
  city: string;
  country: string;
  coordinates: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-game',
  imports: [ 
    CommonModule, 
    CultivosComponent, 
    RiegosComponent,
    GanaderiaComponent, 
    InvestigacionComponent,
    MiniEarthComponent
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  animations: [slideInAnimation]
})
export class GameComponent implements OnInit, OnDestroy, OnChanges {
  title = 'SpaceFarm';
  
  // Recibir datos de ubicación del componente padre
  @Input() userLocationData: LocationData | null = null;
  
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
  notification: string = '';
  showNotification: boolean = false;

  private humiditySubscription?: Subscription;
  private weatherSubscription?: Subscription;

  ngOnInit() {
    this.initializeFarmPlots();
    this.startDataSimulation();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Se ejecuta cuando cambian los datos de entrada
    if (changes['userLocationData'] && this.userLocationData) {
      this.personalizeByLocation();
    }
  }

  ngOnDestroy() {
    if (this.humiditySubscription) {
      this.humiditySubscription.unsubscribe();
    }
    if (this.weatherSubscription) {
      this.weatherSubscription.unsubscribe();
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

  private personalizeByLocation(): void {
    if (!this.userLocationData) {
      // Usar valores por defecto si no hay datos de ubicación
      this.notification = 'Granja inicializada con configuración por defecto';
      this.showNotification = true;
      this.hideNotificationAfterDelay();
      return;
    }

    const { latitude, city, country } = this.userLocationData;
    
    // Personalizar datos según ubicación
    if (Math.abs(latitude) < 23.5) { // Trópicos
      this.weatherData.temperature = 25 + Math.random() * 10;
      this.weatherData.humidity = 70 + Math.random() * 20;
      this.satelliteData.soilHumidity = 60 + Math.random() * 20;
      this.satelliteData.vegetationIndex = Number((0.8 + Math.random() * 0.2).toFixed(2));
      this.cropInfo.type = 'Banano'; // Cultivo tropical
    } else if (Math.abs(latitude) < 50) { // Zonas templadas
      this.weatherData.temperature = 15 + Math.random() * 15;
      this.weatherData.humidity = 50 + Math.random() * 30;
      this.satelliteData.soilHumidity = 40 + Math.random() * 30;
      this.satelliteData.vegetationIndex = Number((0.5 + Math.random() * 0.4).toFixed(2));
      this.cropInfo.type = 'Tomate'; // Cultivo templado
    } else { // Zonas polares/frías
      this.weatherData.temperature = -5 + Math.random() * 20;
      this.weatherData.humidity = 40 + Math.random() * 40;
      this.satelliteData.soilHumidity = 30 + Math.random() * 20;
      this.satelliteData.vegetationIndex = Number((0.2 + Math.random() * 0.3).toFixed(2));
      this.cropInfo.type = 'Papa'; // Cultivo resistente al frío
    }

    // Redondear valores
    this.weatherData.temperature = Math.round(this.weatherData.temperature * 10) / 10;
    this.weatherData.humidity = Math.round(this.weatherData.humidity);
    this.satelliteData.soilHumidity = Math.round(this.satelliteData.soilHumidity);
    this.satelliteData.soilTemperature = Math.round((this.weatherData.temperature - 2 + Math.random() * 4) * 10) / 10;
    this.satelliteData.precipitation = Math.round((Math.random() * 25) * 10) / 10;

    // Mostrar notificación de bienvenida con ubicación
    this.notification = `Bienvenido a SpaceFarm en ${city}, ${country}`;
    this.showNotification = true;
    this.hideNotificationAfterDelay(4000);
  }

  private hideNotificationAfterDelay(delay: number = 3000): void {
    setTimeout(() => {
      this.showNotification = false;
    }, delay);
  }

  startDataSimulation() {
    // Simulación de humedad del suelo
    this.humiditySubscription = interval(5000).subscribe(() => {
      const change = Math.floor(Math.random() * 6) - 3;
      this.satelliteData.soilHumidity = Math.max(0, Math.min(100, this.satelliteData.soilHumidity + change));
    });

    // Simulación de datos del clima
    this.weatherSubscription = interval(10000).subscribe(() => {
      const tempChange = (Math.random() - 0.5) * 2;
      const humidityChange = Math.floor(Math.random() * 6) - 3;
      
      this.weatherData.temperature = Math.max(-10, Math.min(50, this.weatherData.temperature + tempChange));
      this.weatherData.humidity = Math.max(0, Math.min(100, this.weatherData.humidity + humidityChange));
      
      // Simular cambios en el índice de vegetación
      const vegChange = (Math.random() - 0.5) * 0.02;
      this.satelliteData.vegetationIndex = Math.max(0, Math.min(1, this.satelliteData.vegetationIndex + vegChange));
      this.satelliteData.vegetationIndex = Math.round(this.satelliteData.vegetationIndex * 100) / 100;
    });
  }

  onPlotClick(plot: FarmPlot) {
    if (!plot.planted) {
      plot.planted = true;
      plot.cropIcon = this.getRandomCropIcon();
      
      const locationText = this.userLocationData ? 
        ` en ${this.userLocationData.city}` : '';
      
      this.notification = `Semilla plantada${locationText}`;
      this.showNotification = true;
      
      // Actualizar recursos
      this.updateResources('plant');
      
      this.hideNotificationAfterDelay();
    } else {
      // Si ya está plantado, puede cosecharse
      if (this.cropInfo.growth >= 100) {
        plot.planted = false;
        plot.cropIcon = '';
        
        this.notification = 'Cultivo cosechado exitosamente';
        this.showNotification = true;
        
        // Actualizar recursos
        this.updateResources('harvest');
        
        this.hideNotificationAfterDelay();
      }
    }
  }

  private getRandomCropIcon(): string {
    const crops = ['🌱', '🌾', '🥕', '🌽', '🥬', '🍅', '🥔'];
    return crops[Math.floor(Math.random() * crops.length)];
  }

  private updateResources(action: 'plant' | 'harvest'): void {
    if (action === 'plant') {
      // Reducir agua y energía al plantar
      const waterValue = parseInt(this.resources[0].value.replace(/[^\d]/g, ''));
      const energyValue = parseInt(this.resources[1].value.replace(/[^\d]/g, ''));
      
      this.resources[0].value = `${Math.max(0, waterValue - 50).toLocaleString()} L`;
      this.resources[1].value = `${Math.max(0, energyValue - 25)} kW`;
    } else if (action === 'harvest') {
      // Aumentar biomasa y puntos de investigación al cosechar
      const biomassValue = parseInt(this.resources[2].value.replace(/[^\d]/g, ''));
      const researchValue = parseInt(this.resources[3].value.replace(/[^\d]/g, ''));
      
      this.resources[2].value = `${(biomassValue + 150).toLocaleString()} kg`;
      this.resources[3].value = `${researchValue + 5} pts`;
    }
  }

  onActionClick(action: string) {
    const locationText = this.userLocationData ? 
      ` en ${this.userLocationData.city}` : '';
    
    console.log(`Acción ejecutada: ${action}${locationText}`);
    
    // Lógica específica según la acción
    switch (action.toLowerCase()) {
      case 'riego auto':
      case 'manual':
        this.activateIrrigation();
        break;
      case 'análisis suelo':
        this.performSoilAnalysis();
        break;
      case 'predicción':
        this.showWeatherPrediction();
        break;
      default:
        this.notification = `${action} ejecutado${locationText}`;
    }
    
    this.showNotification = true;
    this.hideNotificationAfterDelay();
  }

  private activateIrrigation(): void {
    // Activar riego en parcelas plantadas
    this.farmPlots.forEach(plot => {
      if (plot.planted && !plot.irrigated) {
        plot.irrigated = Math.random() > 0.5; // 50% de probabilidad
      }
    });
    
    this.notification = 'Sistema de riego automático activado';
    
    // Actualizar humedad del suelo
    this.satelliteData.soilHumidity = Math.min(100, this.satelliteData.soilHumidity + 15);
  }

  private performSoilAnalysis(): void {
    const locationText = this.userLocationData ? 
      ` para ${this.userLocationData.city}` : '';
    
    this.notification = `Análisis de suelo completado${locationText}`;
    
    // Simular análisis de suelo
    this.satelliteData.soilTemperature = 18 + Math.random() * 8;
    this.satelliteData.precipitation = Math.random() * 20;
    this.satelliteData.soilTemperature = Math.round(this.satelliteData.soilTemperature * 10) / 10;
    this.satelliteData.precipitation = Math.round(this.satelliteData.precipitation * 10) / 10;
  }

  private showWeatherPrediction(): void {
    const predictions = [
      'Lluvia probable en las próximas 24h',
      'Temperaturas estables durante la semana',
      'Condiciones óptimas para crecimiento',
      'Alerta: Vientos fuertes esperados',
      'Humedad alta favorable para cultivos'
    ];
    
    const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
    this.notification = `Predicción: ${randomPrediction}`;
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