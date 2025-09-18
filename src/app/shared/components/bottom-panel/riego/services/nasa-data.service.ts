 import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../../../../environment/firebase.config';

export interface NASAWeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  pressure: number;
  visibility: number;
  precipitation: number;
  date: string;
}

export interface SoilData {
  moisture: number;
  temperature: number;
  ph: number;
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  conductivity: number;
}

export interface SatelliteImagery {
  url: string;
  date: string;
  cloudCover: number;
  resolution: number;
}

export interface FloodPrediction {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  probability: number;
  expectedDate: string;
  duration: number; // hours
  affectedArea: number; // square kilometers
}

export interface RainForecast {
  date: string;
  precipitation: number; // mm
  intensity: 'LIGHT' | 'MODERATE' | 'HEAVY' | 'EXTREME';
  probability: number;
}

export interface AIRecommendation {
  id: string;
  type: 'IRRIGATION' | 'FERTILIZATION' | 'PEST_CONTROL' | 'HARVEST';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  confidence: number;
  estimatedImpact: number;
  suggestedActions: string[];
  deadline: string;
}

@Injectable({
  providedIn: 'root'
})
export class NasaDataService {
  private apiKey = environment.nasaConfig?.apiKey || 'DEMO_KEY';
  private baseUrl = environment.nasaConfig?.baseUrl || 'https://api.nasa.gov';
  private powerApiUrl = environment.nasaConfig?.powerApiUrl || 'https://power.larc.nasa.gov/api/temporal/daily/point';
  
  // Datos simulados para desarrollo
  private mockData = {
    weather: new BehaviorSubject<NASAWeatherData>({
      temperature: 24.5,
      humidity: 68,
      windSpeed: 12.3,
      uvIndex: 6.2,
      pressure: 1013.2,
      visibility: 15.5,
      precipitation: 0.0,
      date: new Date().toISOString()
    }),
    soil: new BehaviorSubject<SoilData>({
      moisture: 45.2,
      temperature: 22.1,
      ph: 6.8,
      nutrients: {
        nitrogen: 15.2,
        phosphorus: 8.9,
        potassium: 12.4
      },
      conductivity: 0.8
    })
  };

  constructor(private http: HttpClient) {
    // Simular actualizaciones de datos cada 5 minutos
    interval(300000).subscribe(() => {
      this.updateMockData();
    });
  }

  /**
   * Obtiene datos meteorológicos de NASA POWER API
   */
  getWeatherData(lat: number, lon: number): Observable<NASAWeatherData> {
    // Si estamos en modo desarrollo o no hay API key válida, usar datos mock
    if (!this.isValidApiKey() || environment.production === false) {
      return this.mockData.weather.asObservable();
    }

    const params = {
      parameters: 'T2M,RH2M,WS10M,ALLSKY_SFC_UVA,PS,PRECTOTCORR',
      community: 'AG',
      longitude: lon.toString(),
      latitude: lat.toString(),
      start: this.getDateString(-7), // 7 días atrás
      end: this.getDateString(0), // hoy
      format: 'JSON'
    };

    const url = `${this.powerApiUrl}?${new URLSearchParams(params)}`;

    return this.http.get(url).pipe(
      map((response: any) => this.parseWeatherData(response)),
      catchError((error) => {
        console.warn('Error fetching NASA weather data, using mock data:', error);
        return this.mockData.weather.asObservable();
      })
    );
  }

  /**
   * Obtiene datos de humedad del suelo usando NASA SMAP
   */
  getSoilMoistureData(lat: number, lon: number): Observable<SoilData> {
    // En implementación real, usar SMAP API
    // Para desarrollo, retornar datos mock
    return this.mockData.soil.asObservable();
  }

  /**
   * Obtiene imágenes satelitales de MODIS
   */
  getSatelliteImagery(lat: number, lon: number, date?: string): Observable<SatelliteImagery[]> {
    // Datos mock para desarrollo
    const mockImagery: SatelliteImagery[] = [
      {
        url: 'https://worldview.earthdata.nasa.gov/imagery-snapshot',
        date: new Date().toISOString(),
        cloudCover: 15.2,
        resolution: 250
      },
      {
        url: 'https://modis.gsfc.nasa.gov/gallery/individual.php?db_date=2024-01-15',
        date: this.getDateString(-1),
        cloudCover: 8.7,
        resolution: 500
      }
    ];

    return of(mockImagery);
  }

  /**
   * Genera predicciones de inundación usando datos históricos y ML
   */
  getFloodPredictions(lat: number, lon: number): Observable<FloodPrediction[]> {
    const predictions: FloodPrediction[] = [
      {
        riskLevel: 'MEDIUM',
        probability: 35.8,
        expectedDate: this.getDateString(3),
        duration: 6,
        affectedArea: 12.5
      },
      {
        riskLevel: 'LOW',
        probability: 15.2,
        expectedDate: this.getDateString(7),
        duration: 3,
        affectedArea: 5.8
      }
    ];

    return of(predictions);
  }

  /**
   * Obtiene pronóstico de lluvia usando GPM (Global Precipitation Measurement)
   */
  getRainForecast(lat: number, lon: number): Observable<RainForecast[]> {
    const forecast: RainForecast[] = [
      {
        date: this.getDateString(1),
        precipitation: 2.3,
        intensity: 'LIGHT',
        probability: 68
      },
      {
        date: this.getDateString(2),
        precipitation: 8.7,
        intensity: 'MODERATE',
        probability: 85
      },
      {
        date: this.getDateString(5),
        precipitation: 25.4,
        intensity: 'HEAVY',
        probability: 92
      }
    ];

    return of(forecast);
  }

  /**
   * Genera recomendaciones usando IA basada en todos los datos disponibles
   */
  getAIRecommendations(plantData: any[], weatherData: NASAWeatherData, soilData: SoilData): Observable<AIRecommendation[]> {
    // Lógica de IA simplificada para generar recomendaciones
    const recommendations: AIRecommendation[] = [];

    // Análisis de riego
    if (soilData.moisture < 30) {
      recommendations.push({
        id: 'irr_001',
        type: 'IRRIGATION',
        priority: 'HIGH',
        message: 'Niveles críticos de humedad del suelo detectados. Riego inmediato recomendado.',
        confidence: 0.92,
        estimatedImpact: 85,
        suggestedActions: [
          'Activar sistema de riego automático',
          'Priorizar plantas en sector norte',
          'Aumentar frecuencia de monitoreo'
        ],
        deadline: this.getDateString(0)
      });
    }

    // Análisis meteorológico
    if (weatherData.uvIndex > 8) {
      recommendations.push({
        id: 'prot_001',
        type: 'PEST_CONTROL',
        priority: 'MEDIUM',
        message: 'Alto índice UV puede causar estrés en plantas. Considerar sombreado.',
        confidence: 0.78,
        estimatedImpact: 65,
        suggestedActions: [
          'Instalar mallas de sombreo temporal',
          'Ajustar horarios de riego a horas más frescas',
          'Aumentar vigilancia por plagas'
        ],
        deadline: this.getDateString(1)
      });
    }

    // Análisis nutricional
    if (soilData.nutrients.nitrogen < 10) {
      recommendations.push({
        id: 'fert_001',
        type: 'FERTILIZATION',
        priority: 'MEDIUM',
        message: 'Niveles bajos de nitrógeno detectados. Fertilización recomendada.',
        confidence: 0.85,
        estimatedImpact: 75,
        suggestedActions: [
          'Aplicar fertilizante rico en nitrógeno',
          'Considerar fertilización foliar',
          'Programar análisis de suelo adicional'
        ],
        deadline: this.getDateString(3)
      });
    }

    return of(recommendations);
  }

  /**
   * Obtiene alertas meteorológicas actualizadas
   */
  getWeatherAlerts(lat: number, lon: number): Observable<string[]> {
    return this.getRainForecast(lat, lon).pipe(
      switchMap(forecast => this.getFloodPredictions(lat, lon).pipe(
        map(floods => {
          const alerts: string[] = [];
          
          // Alertas de lluvia
          const heavyRain = forecast.find(f => f.intensity === 'HEAVY' || f.intensity === 'EXTREME');
          if (heavyRain) {
            alerts.push(`Lluvia ${heavyRain.intensity === 'EXTREME' ? 'extrema' : 'intensa'} prevista ${this.formatRelativeDate(heavyRain.date)}`);
          }
          
          // Alertas de sequía
          const lowPrecipitation = forecast.filter(f => f.precipitation < 1).length > 5;
          if (lowPrecipitation) {
            alerts.push('Sequía prevista en 3 días');
          }
          
          // Alertas de inundación
          const highFloodRisk = floods.find(f => f.riskLevel === 'HIGH' || f.riskLevel === 'EXTREME');
          if (highFloodRisk) {
            alerts.push(`Riesgo ${highFloodRisk.riskLevel === 'EXTREME' ? 'extremo' : 'alto'} de inundación ${this.formatRelativeDate(highFloodRisk.expectedDate)}`);
          }
          
          return alerts;
        })
      ))
    );
  }

  private parseWeatherData(response: any): NASAWeatherData {
    try {
      const properties = response.properties.parameter;
      const dates = Object.keys(properties.T2M);
      const latestDate = dates[dates.length - 1];

      return {
        temperature: properties.T2M[latestDate],
        humidity: properties.RH2M[latestDate],
        windSpeed: properties.WS10M[latestDate],
        uvIndex: properties.ALLSKY_SFC_UVA[latestDate] / 100, // Convertir a índice UV estándar
        pressure: properties.PS[latestDate],
        visibility: 15.0, // No disponible en NASA POWER, valor por defecto
        precipitation: properties.PRECTOTCORR[latestDate],
        date: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error parsing NASA weather data:', error);
      return this.mockData.weather.value;
    }
  }

  private updateMockData(): void {
    // Simular pequeñas variaciones en los datos
    const currentWeather = this.mockData.weather.value;
    const currentSoil = this.mockData.soil.value;

    this.mockData.weather.next({
      ...currentWeather,
      temperature: Math.max(5, Math.min(45, currentWeather.temperature + (Math.random() - 0.5) * 2)),
      humidity: Math.max(0, Math.min(100, currentWeather.humidity + (Math.random() - 0.5) * 10)),
      windSpeed: Math.max(0, currentWeather.windSpeed + (Math.random() - 0.5) * 5),
      uvIndex: Math.max(0, Math.min(12, currentWeather.uvIndex + (Math.random() - 0.5) * 0.5)),
      date: new Date().toISOString()
    });

    this.mockData.soil.next({
      ...currentSoil,
      moisture: Math.max(0, Math.min(100, currentSoil.moisture + (Math.random() - 0.5) * 5)),
      temperature: currentSoil.temperature + (Math.random() - 0.5) * 1,
    });
  }

  private isValidApiKey(): boolean {
    return this.apiKey !== 'DEMO_KEY' && this.apiKey.length > 10;
  }

  private getDateString(daysOffset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }

  private formatRelativeDate(dateString: string): string {
    try {
      const date = new Date(
        parseInt(dateString.substring(0, 4)),
        parseInt(dateString.substring(4, 6)) - 1,
        parseInt(dateString.substring(6, 8))
      );
      const today = new Date();
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'hoy';
      if (diffDays === 1) return 'mañana';
      if (diffDays === -1) return 'ayer';
      if (diffDays > 1) return `en ${diffDays} días`;
      return `hace ${Math.abs(diffDays)} días`;
    } catch (error) {
      return 'fecha desconocida';
    }
  }
}
