

// Interfaces para tipado fuerte
export interface WeatherParameters {
  T2M: { [date: string]: number };           // Temperatura a 2m (°C)
  RH2M: { [date: string]: number };          // Humedad relativa a 2m (%)
  WS2M: { [date: string]: number };          // Velocidad del viento a 2m (m/s)
  PRECTOT: { [date: string]: number };       // Precipitación total (mm)
  PS: { [date: string]: number };            // Presión superficial (kPa)
  ALLSKY_SFC_SW_DWN: { [date: string]: number }; // Irradiación solar (MJ/m²/day)
}

export interface NasaWeatherResponse {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number, number];
  };
  properties: {
    parameter: WeatherParameters;
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

export interface WeatherDataProcessed {
  location: {
    latitude: number;
    longitude: number;
    elevation: number;
  };
  date: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  pressure: number;
  solarIrradiation: number;
}
