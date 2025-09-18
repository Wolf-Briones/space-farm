import { Component, inject, signal, OnInit } from '@angular/core';
import { WeatherData } from '../../../interfaces/interfaces.test';
import { NasaWeatherService } from '../../../../core/services/nasa-weather.service';
import { ParametersWeatherService } from '../../../../core/services/parameters-weather.service';
import { CommonModule } from '@angular/common';
import { WeatherDataProcessed } from '../../../interfaces/weather.interface';

@Component({
  selector: 'app-current-weather',
  templateUrl: './current-weather.component.html',
  styleUrls: ['./current-weather.component.scss'],
  imports: [CommonModule],
})
export class CurrentWeatherComponent implements OnInit {
  
    private getDailyWeatherDataService = inject(NasaWeatherService);
    private getLocationWeatherParamsService = inject(ParametersWeatherService); 

  // Signals para estado reactivo
  weatherData = signal<WeatherData>({
    temperature: 24,
    humidity: 68,
    windSpeed: 12,
    uvIndex: 6.2,
    pressure: 1013
  });

  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  lastUpdate = signal<string | null>(null); 

  ngOnInit() {
    console.log('🌤️ Componente CurrentWeatherComponent inicializado');
    this.loadWeatherData();
  }

  /**
   * Carga los datos meteorológicos usando parámetros de ubicación
   */
  private async loadWeatherData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Opción 1: Usar parámetros del servicio de ubicación
      const params = await this.getLocationWeatherParamsService.getLocationWeatherParams();
      const dateStr = params.date.split('T')[0].replace(/-/g, '');
      
      console.log('📍 Parámetros de ubicación obtenidos:', { 
        lat: params.lat, 
        lon: params.lon, 
        date: dateStr 
      });

      // Obtener datos de NASA
      this.getDailyWeatherDataService.getDailyWeatherData(params.lat, params.lon, dateStr)
        .subscribe({
          next: (nasaData: WeatherDataProcessed) => {
            console.log('🛰️ Datos NASA recibidos:', nasaData);
            
            // Transformar datos de NASA al formato de tu interfaz
            const transformedData = this.transformNasaDataToWeatherData(nasaData);
            
            this.weatherData.set(transformedData);
            this.lastUpdate.set(new Date().toLocaleString());
            this.loading.set(false);
          },
          error: (error) => {
            console.error('❌ Error obteniendo datos de NASA:', error);
            this.handleError(error);
            // Fallback a datos de ejemplo con error
            this.loadFallbackData();
          }
        });

    } catch (error) {
      console.error('❌ Error obteniendo parámetros de ubicación:', error);
      this.handleError(error as Error);
      // Fallback a coordenadas de ejemplo
      this.loadExampleWeatherData();
    }
  }

  /**
   * Carga datos de ejemplo para pruebas (Los Ángeles)
   */
  private loadExampleWeatherData(): void {
    console.log('🔧 Cargando datos de ejemplo...');
    
    const exampleParams = { 
      lat: 34.05, 
      lon: -118.25, 
      date: this.getCurrentDateString() 
    };
    
    this.getDailyWeatherDataService.getDailyWeatherData(
      exampleParams.lat, 
      exampleParams.lon, 
      exampleParams.date
    ).subscribe({
      next: (nasaData: WeatherDataProcessed) => {
        console.log('🛰️ Datos NASA de ejemplo recibidos:', nasaData);
        
        const transformedData = this.transformNasaDataToWeatherData(nasaData);
        this.weatherData.set(transformedData);
        this.lastUpdate.set(new Date().toLocaleString());
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error con datos de ejemplo:', error);
        this.handleError(error);
        this.loadFallbackData();
      }
    });
  }

  /**
   * Transforma los datos de NASA al formato de tu interfaz WeatherData
   */
  private transformNasaDataToWeatherData(nasaData: WeatherDataProcessed): WeatherData {
    return {
      temperature: Math.round(nasaData.temperature || 0),
      humidity: Math.round(nasaData.humidity || 0),
      windSpeed: Math.round(nasaData.windSpeed || 0),
      pressure: Math.round(nasaData.pressure || 1013),
      // NASA no proporciona UV Index directamente, calculamos una aproximación
      uvIndex: this.calculateUvIndex(nasaData.solarIrradiation || 0)
    };
  }

  /**
   * Calcula una aproximación del índice UV basado en la irradiación solar
   * @param solarIrradiation Irradiación solar en MJ/m²/day
   * @returns Índice UV aproximado
   */
  private calculateUvIndex(solarIrradiation: number): number {
    // Fórmula aproximada: UV Index ≈ Solar Irradiation * 0.4
    // Esto es una aproximación básica, el cálculo real es más complejo
    const uvIndex = solarIrradiation * 0.4;
    return Math.max(0, Math.min(12, Math.round(uvIndex * 10) / 10));
  }

  /**
   * Obtiene la fecha actual en formato YYYYMMDD
   */
  private getCurrentDateString(): string {
    const today = new Date();
    // NASA POWER tiene un delay, usar fecha de ayer para asegurar disponibilidad
    today.setDate(today.getDate() - 1);
    
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${year}${month}${day}`;
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
    console.log('🆘 Cargando datos predeterminados...');
    
    this.weatherData.set({
      temperature: 20,
      humidity: 65,
      windSpeed: 8,
      uvIndex: 5.0,
      pressure: 1013
    });
    
    this.lastUpdate.set('Datos no disponibles');
    this.loading.set(false);
  }

  /**
   * Método público para refrescar datos manualmente
   */
  refreshWeatherData(): void {
    console.log('🔄 Refrescando datos meteorológicos...');
    this.loadWeatherData();
  }

  /**
   * Método público para obtener el estado de carga
   */
  get isLoading(): boolean {
    return this.loading();
  }

  /**
   * Método público para obtener el mensaje de error
   */
  get errorMessage(): string | null {
    return this.error();
  }

  /**
   * Método público para obtener la última actualización
   */
  get lastUpdateTime(): string | null {
    return this.lastUpdate();
  }
}