import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/firebase.config';

export interface TemperaturaResponse {
    location: string;
    temperature: number;
    unit: string;
    timestamp: string;
}

@Injectable({
    providedIn: 'root'
})
export class TemperaturaService {
    private readonly nasaApiUrl = 'https://api.nasa.gov/temperature'; // Reemplaza con el endpoint real
    private apiKey: string = 'TU_API_KEY_AQUI'; // Reemplaza con tu API Key

    constructor(private http: HttpClient) {}

    getTemperaturaPorLugar(location: string): Observable<TemperaturaResponse> {
        const url = `${this.nasaApiUrl}?location=${encodeURIComponent(location)}&api_key=${this.apiKey}`;
        return this.http.get<TemperaturaResponse>(url);
    }

    
}