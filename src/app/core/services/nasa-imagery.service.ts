// src/app/core/services/nasa-imagery.service.ts

import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { NasaSatelliteImage } from '../../shared/interfaces/nasa-imagery.interface';

@Injectable({
  providedIn: 'root'
})
export class NasaImageryService {
  // Cambiamos a la API de Worldview Snapshot
  private readonly worldviewSnapshotApiUrl = 'https://wvs.earthdata.nasa.gov/api/v1/snapshot';

  constructor() { }

  /**
   * Genera una URL para obtener una imagen satelital de la NASA (Worldview Snapshot).
   * @param lat Latitud del centro de la imagen.
   * @param lon Longitud del centro de la imagen.
   * @param date Fecha de la imagen en formato YYYY-MM-DD.
   * @param width Ancho de la imagen en píxeles.
   * @param height Alto de la imagen en píxeles.
   * @param zoomFactor Factor para determinar el tamaño del bounding box (menor = más zoom).
   * @param layer Capa de imagen de Worldview (ej: MODIS_Terra_CorrectedReflectance_TrueColor).
   * @returns Observable que emite un objeto NasaSatelliteImage con la URL.
   */
  getSatelliteImageryUrl(
    lat: number,
    lon: number,
    date: string, // Formato YYYY-MM-DD
    width: number = 200,
    height: number = 200,
    zoomFactor: number = 0.5, // 0.1 para un zoom más cercano, 1.0 para más lejos
    layer: string = 'MODIS_Terra_CorrectedReflectance_TrueColor' // Capa de color verdadero
  ): Observable<NasaSatelliteImage> {
    this.validateInputs(lat, lon, date);

    // Calcular el bounding box (BBOX) alrededor del punto central
    // Un zoomFactor más pequeño significa un área más pequeña, por lo tanto, más "zoom".
    const deltaLat = zoomFactor / 2;
    const deltaLon = zoomFactor / 2;

    const minLat = Math.max(-90, lat - deltaLat);
    const maxLat = Math.min(90, lat + deltaLat);
    const minLon = Math.max(-180, lon - deltaLon);
    const maxLon = Math.min(180, lon + deltaLon);

    const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;

    // Construir la URL de la petición Worldview Snapshot
    const imageUrl = `${this.worldviewSnapshotApiUrl}` +
      `?REQUEST=GetSnapshot` +
      `&TIME=${date}` + // Fecha de la imagen
      `&BBOX=${bbox}` +
      `&LAYERS=${layer}` +
      `&CRS=EPSG:4326` +
      `&FORMAT=image/jpeg` + // Formato de imagen
      `&WIDTH=${width}` +
      `&HEIGHT=${height}`;

    console.log('🖼️ URL de imagen satelital (Worldview) generada:', imageUrl);

    return of({
      imageUrl: imageUrl,
      latitude: lat,
      longitude: lon,
      date: date,
      zoomLevel: 1 / zoomFactor,
      description: `Capa: ${layer}`
    });
  }

  private validateInputs(lat: number, lon: number, date: string): void {
    if (lat < -90 || lat > 90) {
      throw new Error('❌ Latitud debe estar entre -90 y 90 grados');
    }
    if (lon < -180 || lon > 180) {
      throw new Error('❌ Longitud debe estar entre -180 y 180 grados');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('❌ Fecha debe estar en formato YYYY-MM-DD (ej: 2025-09-13)');
    }
  }

  /**
   * Obtiene la fecha para la imagen satelital, retrocediendo X días para asegurar disponibilidad.
   * Aumenta los días de retraso a 5 para mayor seguridad con Worldview.
   */
  private getOffsetDateString(offsetDays: number): string {
    const date = new Date();
    date.setDate(date.getDate() - offsetDays); // Resta 'offsetDays' días
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Obtiene una imagen satelital "actual" (de unos días atrás) para una ubicación.
   * @param lat Latitud
   * @param lon Longitud
   * @returns Observable con la URL de la imagen.
   */
  getCurrentSatelliteImage(lat: number, lon: number): Observable<NasaSatelliteImage> {
    // Aumentamos un poco más el retraso para Worldview (5 días)
    const dateToRequest = this.getOffsetDateString(5); // Prueba con 5 días de retraso
    // También podemos probar un zoomFactor ligeramente diferente si sigue fallando
    // return this.getSatelliteImageryUrl(lat, lon, dateToRequest, 200, 200, 0.8); // Más alejado
    return this.getSatelliteImageryUrl(lat, lon, dateToRequest);
  }
}