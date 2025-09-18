 import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'waterLevelColor',
  standalone: true
})
export class WaterLevelColorPipe implements PipeTransform {

  transform(waterLevel: number, returnType: 'color' | 'class' | 'status' = 'color'): string {
    switch (returnType) {
      case 'color':
        return this.getColor(waterLevel);
      case 'class':
        return this.getCssClass(waterLevel);
      case 'status':
        return this.getStatusText(waterLevel);
      default:
        return this.getColor(waterLevel);
    }
  }

  private getColor(waterLevel: number): string {
    if (waterLevel < 15) return '#C53030'; // Rojo crítico
    if (waterLevel < 25) return '#E53E3E'; // Rojo
    if (waterLevel < 40) return '#DD6B20'; // Naranja
    if (waterLevel < 60) return '#D69E2E'; // Amarillo
    if (waterLevel < 80) return '#38A169'; // Verde
    return '#3182CE'; // Azul (exceso)
  }

  private getCssClass(waterLevel: number): string {
    if (waterLevel < 15) return 'water-critical';
    if (waterLevel < 25) return 'water-very-low';
    if (waterLevel < 40) return 'water-low';
    if (waterLevel < 60) return 'water-medium';
    if (waterLevel < 80) return 'water-good';
    return 'water-high';
  }

  private getStatusText(waterLevel: number): string {
    if (waterLevel < 15) return 'Crítico';
    if (waterLevel < 25) return 'Muy Bajo';
    if (waterLevel < 40) return 'Bajo';
    if (waterLevel < 60) return 'Medio';
    if (waterLevel < 80) return 'Bueno';
    return 'Alto';
  }
}
