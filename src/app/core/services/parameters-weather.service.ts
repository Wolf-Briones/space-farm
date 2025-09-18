// src/app/shared/services/parameters-weather.service.ts
import { Injectable } from '@angular/core';

export interface LocationWeatherParams {
    lat: number;
    lon: number;
    date: string; // Formato ISO string para compatibilidad
}

@Injectable({
    providedIn: 'root'
})
export class ParametersWeatherService {

    // Coordenadas por defecto (ej. Centro de Los Ángeles o un punto genérico)
    private defaultLat = 34.0522;
    private defaultLon = -118.2437;

    constructor() { }

    async getLocationWeatherParams(): Promise<LocationWeatherParams> {
        return new Promise<LocationWeatherParams>((resolve) => { // ¡Cambiamos reject por resolve!
            if (!navigator.geolocation) {
                console.warn('⚠️ Geolocation is not supported by this browser. Using default location.');
                this.resolveWithDefaultLocation(resolve);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    // Tu lógica actual para la fecha (2 días atrás)
                    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
                    resolve({ lat, lon, date });
                },
                (error) => {
                    console.error('❌ Error obteniendo geolocalización:', error.message);
                    console.warn(`📍 Usando ubicación por defecto (${this.defaultLat}, ${this.defaultLon}) debido a: ${error.message}`);
                    this.resolveWithDefaultLocation(resolve);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        });
    }

    private resolveWithDefaultLocation(resolve: (value: LocationWeatherParams | PromiseLike<LocationWeatherParams>) => void): void {
        const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(); // Fecha de ejemplo
        resolve({ lat: this.defaultLat, lon: this.defaultLon, date });
    }
}