
// Interfaces para el tipado fuerte
export interface CropInfo {
  id?: string;
  tipo: string;
  crecimiento: number; // Porcentaje (0-100)
  salud: 'Excelente' | 'Buena' | 'Regular' | 'Mala';
  diasParaCosecha: number;
  rendimientoEst: number; // kg/m²
  fechaPlantado?: Date;
  fechaEstimadaCosecha?: Date;
  ubicacion?: {
    lat: number;
    lon: number;
    nombre?: string;
  };
  notas?: string;
  ultimaActualizacion?: Date;
  growth?: number; // Progreso de crecimiento (0-100)
  estimatedYield?: number; // Rendimiento estimado en kg/m²
  healthStatus?: string; // Estado de salud como texto
  daysToHarvest?: number; // Días restantes para la cosecha
  type?: string; // Tipo de cultivo
}

export interface CropData {
  crops: CropInfo[];
  totalCrops: number;
  activeCrops: number;
  averageHealth: string;
} 