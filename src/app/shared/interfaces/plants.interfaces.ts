
// Interfaces
export interface Plant {
  id: number;
  type: string;
  waterLevel: number; // 0-100
  health: number; // 0-100
  growth: number; // 0-100
  daysToHarvest: number;
  expectedYield: number;
  position: { row: number; col: number };
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  pressure: number;
  visibility?: number;
  alerts?: string[];
} 

export interface AIRecommendation {
  type: 'warning' | 'info' | 'success';
  message: string;
  priority: number;
  confidence: number;
}

export interface ScheduleForm {
  type: string;
  frequency: string;
  startTime: string;
  duration: number;
}

export interface Notification {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
}