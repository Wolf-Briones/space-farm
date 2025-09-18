 import { Pipe, PipeTransform } from '@angular/core';

interface Plant {
  waterLevel: number;
  health: number;
  growth: number;
  type: string;
}

@Pipe({
  name: 'plantHealthStatus',
  standalone: true
})
export class PlantHealthStatusPipe implements PipeTransform {

  transform(
    plant: Plant, 
    returnType: 'status' | 'color' | 'icon' | 'recommendation' = 'status'
  ): string {
    if (!plant) return '';
    
    switch (returnType) {
      case 'status':
        return this.getOverallStatus(plant);
      case 'color':
        return this.getStatusColor(plant);
      case 'icon':
        return this.getStatusIcon(plant);
      case 'recommendation':
        return this.getRecommendation(plant);
      default:
        return this.getOverallStatus(plant);
    }
  }

  private getOverallStatus(plant: Plant): string {
    const avgHealth = (plant.waterLevel + plant.health + plant.growth) / 3;
    
    if (plant.waterLevel < 15) return 'Crítico - Sin Agua';
    if (plant.health < 20) return 'Crítico - Enfermo';
    if (avgHealth < 30) return 'Muy Malo';
    if (avgHealth < 50) return 'Malo';
    if (avgHealth < 70) return 'Regular';
    if (avgHealth < 85) return 'Bueno';
    return 'Excelente';
  }

  private getStatusColor(plant: Plant): string {
    const avgHealth = (plant.waterLevel + plant.health + plant.growth) / 3;
    
    if (plant.waterLevel < 15 || plant.health < 20) return '#C53030';
    if (avgHealth < 30) return '#E53E3E';
    if (avgHealth < 50) return '#DD6B20';
    if (avgHealth < 70) return '#D69E2E';
    if (avgHealth < 85) return '#38A169';
    return '#00D4AA';
  }

  private getStatusIcon(plant: Plant): string {
    const avgHealth = (plant.waterLevel + plant.health + plant.growth) / 3;
    
    if (plant.waterLevel < 15) return '🚨';
    if (plant.health < 20) return '🦠';
    if (avgHealth < 30) return '💀';
    if (avgHealth < 50) return '😷';
    if (avgHealth < 70) return '😐';
    if (avgHealth < 85) return '😊';
    return '🌟';
  }

  private getRecommendation(plant: Plant): string {
    const recommendations: string[] = [];
    
    // Análisis de agua
    if (plant.waterLevel < 15) {
      recommendations.push('🚨 REGAR INMEDIATAMENTE');
    } else if (plant.waterLevel < 30) {
      recommendations.push('💧 Regar pronto');
    } else if (plant.waterLevel > 90) {
      recommendations.push('⚠️ Reducir riego');
    }
    
    // Análisis de salud
    if (plant.health < 25) {
      recommendations.push('🌿 Aplicar tratamiento');
    } else if (plant.health < 50) {
      recommendations.push('🔍 Revisar plagas');
    }
    
    // Análisis de crecimiento
    if (plant.growth < 30) {
      recommendations.push('🌱 Fertilizar');
    } else if (plant.growth > 85) {
      recommendations.push('✂️ Considerar poda');
    }
    
    // Recomendaciones específicas por tipo de planta
    const plantSpecific = this.getPlantSpecificRecommendation(plant);
    if (plantSpecific) {
      recommendations.push(plantSpecific);
    }
    
    if (recommendations.length === 0) {
      return '✅ Planta en buen estado';
    }
    
    return recommendations[0]; // Retorna la recomendación más prioritaria
  }

  private getPlantSpecificRecommendation(plant: Plant): string | null {
    switch (plant.type.toLowerCase()) {
      case 'tomate':
        if (plant.waterLevel > 80 && plant.health < 60) {
          return '🍅 Cuidado: tomates sensibles al exceso de agua';
        }
        break;
      case 'lechuga':
        if (plant.growth > 70) {
          return '🥬 Listo para cosecha pronto';
        }
        break;
      case 'zanahoria':
        if (plant.waterLevel < 40) {
          return '🥕 Zanahorias necesitan riego constante';
        }
        break;
      case 'pimiento':
        if (plant.waterLevel < 50 && plant.health > 70) {
          return '🌶️ Aumentar riego para mejor producción';
        }
        break;
      case 'maíz':
        if (plant.waterLevel < 60) {
          return '🌽 Maíz requiere mucha agua';
        }
        break;
      case 'brócoli':
        if (plant.health < 60) {
          return '🥦 Brócoli sensible a temperaturas';
        }
        break;
      case 'pepino':
        if (plant.waterLevel < 70) {
          return '🥒 Pepino necesita riego frecuente';
        }
        break;
      case 'cebolla':
        if (plant.waterLevel > 75) {
          return '🧅 Cebolla prefiere suelo menos húmedo';
        }
        break;
    }
    return null;
  }
}
