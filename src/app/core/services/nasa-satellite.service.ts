// src/app/core/services/nasa-satellite.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { 
  NasaPowerSatelliteResponse, 
  SatelliteDataProcessed 
} from '../../shared/interfaces/satellite-data.interface';

@Injectable({
  providedIn: 'root'
})
export class NasaSatelliteService {
  private readonly apiUrl = 'https://power.larc.nasa.gov/api/temporal/daily/point';
  // TS: Surface Skin Temperature (°C)
  // PRECTOT: Total Precipitation (mm)
  // NOTA: Para Humedad del suelo (SMAP) e Índice de vegetación (NDVI), la API POWER
  // no ofrece parámetros directos y sencillos para point daily 'AG' community.
  // Sería necesario integrar otras APIs de NASA para obtener datos puros de satélite.
  private readonly defaultParameters = 'TS,PRECTOT';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene datos satelitales diarios (aproximados de NASA POWER) para una ubicación y fecha específicas.
   * Incluye temperatura de superficie y precipitación.
   * Para humedad del suelo e índice de vegetación, se requerirían otras APIs de NASA.
   * @param lat Latitud del lugar (-90 a 90)
   * @param lon Longitud del lugar (-180 a 180)
   * @param date Fecha en formato YYYYMMDD
   * @param parameters Parámetros específicos (opcional)
   * @returns Observable con los datos procesados
   */
  getDailySatelliteData(
    lat: number, 
    lon: number, 
    date: string,
    parameters?: string
  ): Observable<SatelliteDataProcessed> {
    this.validateInputs(lat, lon, date);

    const params = this.buildHttpParams(lat, lon, date, parameters);
    
    console.log(`🛰️ Solicitando datos satelitales:`, {
      latitud: lat,
      longitud: lon,
      fecha: date,
      url: `${this.apiUrl}?${params.toString()}`
    });

    return this.http.get<NasaPowerSatelliteResponse>(this.apiUrl, { params })
      .pipe(
        retry(2),
        map(response => this.processSatelliteResponse(response, date)),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Obtiene datos satelitales actuales (fecha de ayer por el delay de la API)
   * @param lat Latitud
   * @param lon Longitud
   * @returns Observable con datos del día actual (o el más reciente disponible)
   */
  getCurrentSatelliteData(lat: number, lon: number): Observable<SatelliteDataProcessed> {
    const today = this.formatDateToYYYYMMDD(new Date());
    // La API NASA POWER tiene un retraso, así que solicitamos la fecha de ayer
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = this.formatDateToYYYYMMDD(yesterday);
    return this.getDailySatelliteData(lat, lon, yesterdayStr);
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
  }

  private buildHttpParams(
    lat: number, 
    lon: number, 
    date: string, 
    parameters?: string
  ): HttpParams {
    return new HttpParams()
      .set('parameters', parameters || this.defaultParameters)
      .set('community', 'AG') // Comunidad agrícola
      .set('site-elevation', '1') // Elevación del sitio (ejemplo)
      .set('start', date)
      .set('end', date)
      .set('latitude', lat.toString())
      .set('longitude', lon.toString())
      .set('format', 'JSON');
  }

  private processSatelliteResponse(
    response: NasaPowerSatelliteResponse, 
    date: string
  ): SatelliteDataProcessed {
    const params = response.properties.parameter;
    const coords = response.geometry.coordinates;
    
    return {
      location: {
        latitude: coords[1],
        longitude: coords[0],
        elevation: coords[2]
      },
      date: date,
      soilTemperature: params.TS?.[date] ?? null,
      precipitation: params.PRECTOT?.[date] ?? null,
      // Usamos valores nulos para los que no están directamente en POWER API
      soilMoisture: null, // Placeholder: Requiere API SMAP o modelo
      vegetationIndex: null // Placeholder: Requiere API MODIS/VIIRS o modelo
    };
  }

  private formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido al obtener datos satelitales';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `🔌 Error de conexión: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400: errorMessage = '❌ Parámetros inválidos en la solicitud'; break;
        case 404: errorMessage = '🔍 No se encontraron datos para la ubicación/fecha especificada'; break;
        case 429: errorMessage = '⏰ Límite de solicitudes excedido. Intenta más tarde'; break;
        case 500: errorMessage = '🔧 Error interno del servidor NASA POWER'; break;
        default: errorMessage = `🚫 Error HTTP ${error.status}: ${error.message}`;
      }
    }
    console.error('🛰️ Error en NASA Satellite Service:', {
      status: error.status,
      message: errorMessage,
      url: error.url,
      timestamp: new Date().toISOString()
    });
    return throwError(() => new Error(errorMessage));
  }
}