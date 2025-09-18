// src/app/shared/components/left-panel/nasa-satellite-view/nasa-satellite-view.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NasaImageryService } from '../../../../core/services/nasa-imagery.service';
import { ParametersWeatherService } from '../../../../core/services/parameters-weather.service';
import { NasaSatelliteImage } from '../../../interfaces/nasa-imagery.interface';

@Component({
  selector: 'app-nasa-satellite-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nasa-satellite-view.component.html',
  styleUrls: ['./nasa-satellite-view.component.scss'],
})
export class NasaSatelliteViewComponent implements OnInit {

  private nasaImageryService = inject(NasaImageryService);
  private locationParamsService = inject(ParametersWeatherService);

  satelliteImage = signal<NasaSatelliteImage | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Ya no necesitamos defaultLat/Lon aquí, el servicio ParametersWeatherService los gestiona.

  ngOnInit() {
    console.log('🛰️ Componente NasaSatelliteViewComponent inicializado');
    this.loadSatelliteImage();
  }

  private async loadSatelliteImage(): Promise<void> {
    this.loading.set(true);
    this.error.set(null); // Limpiar errores anteriores

    try {
      // ParametersWeatherService ahora siempre resuelve, incluso con valores por defecto
      const params = await this.locationParamsService.getLocationWeatherParams();
      const lat = params.lat;
      const lon = params.lon;
      const date = new Date(params.date).toISOString().split('T')[0]; // Asegurarse de que la fecha esté en YYYY-MM-DD

      this.nasaImageryService.getSatelliteImageryUrl(lat, lon, date) // Usar getSatelliteImageryUrl directamente
        .subscribe({
          next: (imageData: NasaSatelliteImage) => {
            this.satelliteImage.set(imageData);
            this.loading.set(false);
          },
          error: (err) => {
            console.error('❌ Error obteniendo imagen satelital de la NASA:', err);
            this.handleError(err);
            this.loadFallbackImage(); // Cargar fallback si la API de NASA falla
          }
        });
    } catch (err) {
      console.error('❌ Error al obtener parámetros de ubicación o procesar:', err);
      this.handleError(err as Error);
      this.loadFallbackImage(); // Cargar fallback si falla la obtención de parámetros
    }
  }

  private handleError(error: Error): void {
    this.error.set(error.message || 'Error desconocido al cargar la imagen satelital.');
    this.loading.set(false);
  }

  private loadFallbackImage(): void {
    console.log('🆘 Cargando imagen satelital de fallback...');
    this.satelliteImage.set({
      // SVG Base64 mejorado y corregido
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMwNjBhMjUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9ImFyaWFsIiBmb250LXNpemU9IjE4cHgiIGZpbGw9IiM0Y2E3YzEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+TkFTQSBWaWV3IFVucy48L3RleHQ+PC9zdmc+',
      latitude: 0, longitude: 0, // Valores de ejemplo para el fallback
      date: new Date().toISOString().split('T')[0],
      description: 'Imagen no disponible. Intenta de nuevo más tarde.'
    });
    this.loading.set(false);
  }

  refreshImage(): void {
    console.log('🔄 Refrescando imagen satelital...');
    this.loadSatelliteImage();
  }
}