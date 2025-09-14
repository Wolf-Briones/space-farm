
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { NasaWeatherResponse, WeatherDataProcessed } from '../../shared/interfaces/weather.interface';

@Injectable({
  providedIn: 'root'
})
export class NasaWeatherService {
  private readonly apiUrl = 'https://power.larc.nasa.gov/api/temporal/daily/point';
  private readonly defaultParameters = 'T2M,RH2M,WS2M,PRECTOT,PS,ALLSKY_SFC_SW_DWN';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene datos climáticos diarios para una ubicación y fecha específicas.
   * @param lat Latitud del lugar (-90 a 90)
   * @param lon Longitud del lugar (-180 a 180)
   * @param date Fecha en formato YYYYMMDD
   * @param parameters Parámetros específicos (opcional)
   * @returns Observable con los datos procesados
   */
  getDailyWeatherData(
    lat: number, 
    lon: number, 
    date: string,
    parameters?: string
  ): Observable<WeatherDataProcessed> {
    // Validar parámetros de entrada
    this.validateInputs(lat, lon, date);

    const params = this.buildHttpParams(lat, lon, date, parameters);
    
    console.log(`🌤️ Solicitando datos meteorológicos:`, {
      latitud: lat,
      longitud: lon,
      fecha: date,
      url: `${this.apiUrl}?${params.toString()}`
    });

    return this.http.get<NasaWeatherResponse>(this.apiUrl, { params })
      .pipe(
        retry(2),
        map(response => this.processWeatherResponse(response, date)),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Obtiene datos para un rango de fechas
   * @param lat Latitud
   * @param lon Longitud
   * @param startDate Fecha inicio YYYYMMDD
   * @param endDate Fecha fin YYYYMMDD
   * @returns Observable con array de datos procesados
   */
  getWeatherDataRange(
    lat: number,
    lon: number,
    startDate: string,
    endDate: string
  ): Observable<WeatherDataProcessed[]> {
    this.validateInputs(lat, lon, startDate);
    this.validateInputs(lat, lon, endDate);

    const params = new HttpParams()
      .set('parameters', this.defaultParameters)
      .set('community', 'AG')
      .set('site-elevation', '1')
      .set('start', startDate)
      .set('end', endDate)
      .set('latitude', lat.toString())
      .set('longitude', lon.toString())
      .set('format', 'JSON');

    return this.http.get<NasaWeatherResponse>(this.apiUrl, { params })
      .pipe(
        retry(2),
        map(response => this.processWeatherRangeResponse(response)),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Obtiene datos meteorológicos actuales (fecha de hoy)
   * @param lat Latitud
   * @param lon Longitud
   * @returns Observable con datos del día actual
   */
  getCurrentWeatherData(lat: number, lon: number): Observable<WeatherDataProcessed> {
    const today = this.formatDateToYYYYMMDD(new Date());
    return this.getDailyWeatherData(lat, lon, today);
  }

  private validateInputs(lat: number, lon: number, date: string): void {
    if (lat < -90 || lat > 90) {
      throw new Error('❌ Latitud debe estar entre -90 y 90 grados');
    }
    
    if (lon < -180 || lon > 180) {
      throw new Error('❌ Longitud debe estar entre -180 y 180 grados');
    }
    
    if (!/^\d{8}$/.test(date)) {
      throw new Error('❌ Fecha debe estar en formato YYYYMMDD (ej: 20250913)');
    }

    // Validar que la fecha no sea futura (NASA POWER tiene delay)
    const inputDate = new Date(
      parseInt(date.substr(0, 4)),
      parseInt(date.substr(4, 2)) - 1,
      parseInt(date.substr(6, 2))
    );
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (inputDate > yesterday) {
      console.warn('⚠️ NASA POWER puede no tener datos para fechas muy recientes');
    }
  }

  private buildHttpParams(
    lat: number, 
    lon: number, 
    date: string, 
    parameters?: string
  ): HttpParams {
    return new HttpParams()
      .set('parameters', parameters || this.defaultParameters)
      .set('community', 'AG')
      .set('site-elevation', '1')
      .set('start', date)
      .set('end', date)
      .set('latitude', lat.toString())
      .set('longitude', lon.toString())
      .set('format', 'JSON');
  }

  private processWeatherResponse(
    response: NasaWeatherResponse, 
    date: string
  ): WeatherDataProcessed {
    const params = response.properties.parameter;
    const coords = response.geometry.coordinates;
    
    return {
      location: {
        latitude: coords[1],
        longitude: coords[0],
        elevation: coords[2]
      },
      date: date,
      temperature: params.T2M?.[date] ?? null,
      humidity: params.RH2M?.[date] ?? null,
      windSpeed: params.WS2M?.[date] ?? null,
      precipitation: params.PRECTOT?.[date] ?? null,
      pressure: params.PS?.[date] ?? null,
      solarIrradiation: params.ALLSKY_SFC_SW_DWN?.[date] ?? null
    };
  }

  private processWeatherRangeResponse(response: NasaWeatherResponse): WeatherDataProcessed[] {
    const params = response.properties.parameter;
    const coords = response.geometry.coordinates;
    const results: WeatherDataProcessed[] = [];

    // Obtener todas las fechas disponibles
    const dates = Object.keys(params.T2M || {});
    
    dates.forEach(date => {
      results.push({
        location: {
          latitude: coords[1],
          longitude: coords[0],
          elevation: coords[2]
        },
        date: date,
        temperature: params.T2M?.[date] ?? null,
        humidity: params.RH2M?.[date] ?? null,
        windSpeed: params.WS2M?.[date] ?? null,
        precipitation: params.PRECTOT?.[date] ?? null,
        pressure: params.PS?.[date] ?? null,
        solarIrradiation: params.ALLSKY_SFC_SW_DWN?.[date] ?? null
      });
    });

    return results.sort((a, b) => a.date.localeCompare(b.date));
  }

  private formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido al obtener datos meteorológicos';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `🔌 Error de conexión: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = '❌ Parámetros inválidos en la solicitud';
          break;
        case 404:
          errorMessage = '🔍 No se encontraron datos para la ubicación/fecha especificada';
          break;
        case 429:
          errorMessage = '⏰ Límite de solicitudes excedido. Intenta más tarde';
          break;
        case 500:
          errorMessage = '🔧 Error interno del servidor NASA POWER';
          break;
        default:
          errorMessage = `🚫 Error HTTP ${error.status}: ${error.message}`;
      }
    }
    
    console.error('🌩️ Error en NASA Weather Service:', {
      status: error.status,
      message: errorMessage,
      url: error.url,
      timestamp: new Date().toISOString()
    });
    
    return throwError(() => new Error(errorMessage));
  }
}