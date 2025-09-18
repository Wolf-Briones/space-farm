// src/app/shared/components/left-panel/satellite-data/satellite-data.component.ts

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf
import { NasaSatelliteService } from '../../../../core/services/nasa-satellite.service';
import { ParametersWeatherService } from '../../../../core/services/parameters-weather.service'; // Asumo que se usa el mismo para la ubicación
import { SatelliteDataProcessed, SatelliteDataDisplay } from '../../../interfaces/satellite-data.interface';

@Component({
  selector: 'app-satellite-data',
  standalone: true, // Marcar como standalone si tu proyecto Angular es 15+
  imports: [CommonModule],
  templateUrl: './satellite-data.component.html',
  styleUrls: ['./satellite-data.component.scss'],
})
export class SatelliteDataComponent implements OnInit {

  private nasaSatelliteService = inject(NasaSatelliteService);
  private getLocationWeatherParamsService = inject(ParametersWeatherService);

  // Signals para estado reactivo
  satelliteData = signal<SatelliteDataDisplay>({
    soilMoisture: 0,
    vegetationIndex: 0,
    soilTemperature: 0,
    precipitation: 0
  });

  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  lastUpdate = signal<string | null>(null);

  ngOnInit() {
    console.log('🛰️ Componente SatelliteDataComponent inicializado');
    this.loadSatelliteData();
  }

  /**
   * Carga los datos satelitales usando parámetros de ubicación
   */
  private async loadSatelliteData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const params = await this.getLocationWeatherParamsService.getLocationWeatherParams();
      // Usar la fecha de ayer para asegurar que los datos estén disponibles en NASA POWER
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = this.formatDateToYYYYMMDD(yesterday);
      
      console.log('📍 Parámetros de ubicación para satélite obtenidos:', { 
        lat: params.lat, 
        lon: params.lon, 
        date: dateStr 
      });

      this.nasaSatelliteService.getDailySatelliteData(params.lat, params.lon, dateStr)
        .subscribe({
          next: (nasaData: SatelliteDataProcessed) => {
            console.log('🛰️ Datos Satelitales (POWER) recibidos:', nasaData);
            const transformedData = this.transformNasaDataToSatelliteData(nasaData);
            this.satelliteData.set(transformedData);
            this.lastUpdate.set(new Date().toLocaleString());
            this.loading.set(false);
          },
          error: (error) => {
            console.error('❌ Error obteniendo datos satelitales de NASA:', error);
            this.handleError(error);
            this.loadFallbackData();
          }
        });

    } catch (error) {
      console.error('❌ Error obteniendo parámetros de ubicación para satélite:', error);
      this.handleError(error as Error);
      this.loadExampleSatelliteData();
    }
  }

  /**
   * Carga datos de ejemplo para pruebas si falla la ubicación o la API
   */
  private loadExampleSatelliteData(): void {
    console.log('🔧 Cargando datos satelitales de ejemplo...');
    const exampleParams = { 
      lat: 34.05, 
      lon: -118.25, 
      date: this.formatDateToYYYYMMDD(new Date(new Date().setDate(new Date().getDate() - 1)))
    };
    
    this.nasaSatelliteService.getDailySatelliteData(
      exampleParams.lat, 
      exampleParams.lon, 
      exampleParams.date
    ).subscribe({
      next: (nasaData: SatelliteDataProcessed) => {
        console.log('🛰️ Datos Satelitales (POWER) de ejemplo recibidos:', nasaData);
        const transformedData = this.transformNasaDataToSatelliteData(nasaData);
        this.satelliteData.set(transformedData);
        this.lastUpdate.set(new Date().toLocaleString());
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error con datos satelitales de ejemplo:', error);
        this.handleError(error);
        this.loadFallbackData();
      }
    });
  }

  /**
   * Transforma los datos procesados de NASA al formato de tu interfaz SatelliteDataDisplay
   */
  private transformNasaDataToSatelliteData(nasaData: SatelliteDataProcessed): SatelliteDataDisplay {
    return {
      // NOTA: Para Humedad del suelo y Índice de vegetación, la API POWER no proporciona datos directos.
      // Aquí estamos usando valores predeterminados o una simulación simple.
      // Para datos reales se necesitarían APIs de NASA específicas (e.g., SMAP, MODIS/VIIRS NDVI).
      soilMoisture: nasaData.soilMoisture !== null ? Math.round(nasaData.soilMoisture) : 42, // Ejemplo, usar un valor fijo o simulado
      vegetationIndex: nasaData.vegetationIndex !== null ? parseFloat(nasaData.vegetationIndex.toFixed(2)) : 0.65, // Ejemplo
      soilTemperature: Math.round(nasaData.soilTemperature || 0),
      precipitation: Math.round(nasaData.precipitation || 0)
    };
  }

  /**
   * Maneja errores y actualiza el estado
   */
  private handleError(error: Error): void {
    this.error.set(error.message);
    this.loading.set(false);
  }

  /**
   * Carga datos predeterminados cuando falla todo lo demás
   */
  private loadFallbackData(): void {
    console.log('🆘 Cargando datos satelitales predeterminados...');
    this.satelliteData.set({
      soilMoisture: 55, // Valor de fallback
      vegetationIndex: 0.70, // Valor de fallback
      soilTemperature: 25, // Valor de fallback
      precipitation: 5 // Valor de fallback
    });
    this.lastUpdate.set('Datos no disponibles');
    this.loading.set(false);
  }

  /**
   * Obtiene la fecha actual en formato YYYYMMDD
   */
  private formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  refreshSatelliteData(): void {
    console.log('🔄 Refrescando datos satelitales...');
    this.loadSatelliteData();
  }

  get isLoading(): boolean {
    return this.loading();
  }

  get errorMessage(): string | null {
    return this.error();
  }

  get lastUpdateTime(): string | null {
    return this.lastUpdate();
  }
}