// src/app/shared/interfaces/satellite-data.interface.ts

// Esta interfaz se basa en la estructura de respuesta de la API de NASA POWER,
// similar a NasaWeatherResponse, pero enfocada en parámetros satelitales/de superficie.
export interface NasaPowerSatelliteParameters {
  TS: { [date: string]: number }; // Temperatura de la superficie (C)
  PRECTOT: { [date: string]: number }; // Precipitación total (mm)
  // Nota: La API NASA POWER no proporciona directamente "Humedad del suelo" (SMAP) o "Índice de vegetación" (NDVI)
  // en su endpoint diario de punto para la comunidad 'AG' de manera sencilla.
  // Podríamos usar proxies o integrar otras APIs de NASA para esto.
  // Por ahora, para demostrar la estructura, los dejaremos como placeholders o con valores por defecto.
  // Si deseas integrar datos reales de SMAP o MODIS para estos, el enfoque API sería diferente y más complejo.
}

export interface NasaPowerSatelliteResponse {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number, number]; // [longitude, latitude, elevation]
  };
  properties: {
    parameter: NasaPowerSatelliteParameters;
  };
  header: {
    title: string;
    api: {
      version: string;
      name: string;
    };
    sources: string[];
  };
  messages: string[];
  parameters: {
    [key: string]: {
      longname: string;
      units: string;
    };
  };
  times: {
    start: number;
    end: number;
  };
}

// Interfaz para los datos satelitales ya procesados y listos para el componente
export interface SatelliteDataProcessed {
  location: {
    latitude: number;
    longitude: number;
    elevation: number;
  };
  date: string;
  soilMoisture: number | null; // Placeholder, ya que no hay un parámetro directo SMAP en la API POWER AG point daily
  vegetationIndex: number | null; // Placeholder, ya que no hay un parámetro directo NDVI en la API POWER AG point daily
  soilTemperature: number | null; // Usaremos TS (Surface Skin Temperature)
  precipitation: number | null; // Usaremos PRECTOT (Total Precipitation)
}

// Interfaz para el formato final que el componente de UI mostrará
export interface SatelliteDataDisplay {
  soilMoisture: number;
  vegetationIndex: number;
  soilTemperature: number;
  precipitation: number;
}