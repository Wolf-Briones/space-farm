import { Injectable } from '@angular/core';

export interface LocationWeatherParams {
    lat: number;
    lon: number;
    date: string;
}

@Injectable({
    providedIn: 'root'
})
export class ParametersWeatherService {

    async getLocationWeatherParams(): Promise<LocationWeatherParams> {
        return new Promise<LocationWeatherParams>((resolve, reject) => {
            if (!navigator.geolocation) {
                reject('Geolocation is not supported by this browser.');
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
                    resolve({ lat, lon, date });
                },
                (error) => {
                    reject('Unable to retrieve location: ' + error.message);
                }
            );
        });
    }
}