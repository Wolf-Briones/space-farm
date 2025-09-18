// app.component.ts
import { Component } from '@angular/core';
import { EarthComponent } from './views/earth/earth.component';
import { GameComponent } from './views/game/game.component';
import { CommonModule } from '@angular/common';

interface LocationData {
  city: string;
  country: string;
  coordinates: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, EarthComponent, GameComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'spacefarmapp';
  
  // Estado de la aplicación
  gameStarted = false;
  userLocationData: LocationData | null = null;

  // Método que se ejecuta cuando el usuario hace clic en "Iniciar SpaceFarm"
  onStartGame(locationData: LocationData): void {
    console.log('Iniciando SpaceFarm con ubicación:', locationData);
    
    // Guardar los datos de ubicación
    this.userLocationData = locationData;
    
    // Cambiar a la vista del juego
    this.gameStarted = true;
    
    // Opcional: Guardar en localStorage para futuras sesiones
    this.saveLocationData(locationData);
  }

  private saveLocationData(locationData: LocationData): void {
    try {
      localStorage.setItem('spacefarm_user_location', JSON.stringify(locationData));
    } catch (error) {
      console.warn('No se pudo guardar la ubicación en localStorage:', error);
    }
  }

  // Opcional: Cargar ubicación guardada al iniciar la app
  ngOnInit(): void {
    const savedLocation = this.loadSavedLocation();
    if (savedLocation) {
      this.userLocationData = savedLocation;
      // Si quieres ir directamente al juego con la ubicación guardada:
      // this.gameStarted = true;
    }
  }

  private loadSavedLocation(): LocationData | null {
    try {
      const saved = localStorage.getItem('spacefarm_user_location');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('No se pudo cargar la ubicación guardada:', error);
      return null;
    }
  }
}