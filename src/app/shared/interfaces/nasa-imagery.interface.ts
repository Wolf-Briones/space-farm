// src/app/shared/interfaces/nasa-imagery.interface.ts

// Interfaz para la información de una imagen satelital
export interface NasaSatelliteImage {
  imageUrl: string;      // URL de la imagen satelital
  latitude: number;
  longitude: number;
  date: string;          // Fecha de la imagen (YYYY-MM-DD)
  zoomLevel?: number;    // Nivel de zoom aproximado (si aplica)
  description?: string;  // Descripción de la capa usada (e.g., "Color Verdadero MODIS Terra")
}

// Podrías añadir interfaces para los parámetros si la lógica se vuelve más compleja,
// pero por ahora, la URL es el principal output.