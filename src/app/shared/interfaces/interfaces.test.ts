
export interface Resource {
  type: 'water' | 'energy' | 'biomass' | 'research';
  value: string;
  icon: string;
}

export interface SatelliteData {
  soilHumidity: number;
  vegetationIndex: number;
  soilTemperature: number;
  precipitation: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  pressure: number;
}

export interface CropInfo { 
    id: string;
  type: string;
  growth: number;
  health: string;
  daysToHarvest: number;
  estimatedYield: number;
  ultimaActualizacion?: Date;
  fechaEstimadaCosecha?: Date;
  fechaPlantado?: Date;
  diasParaCosecha?: number;
  crecimiento?: number;
}

export interface FarmPlot {
  id: number;
  planted: boolean;
  irrigated: boolean;
  cropIcon: string;
}