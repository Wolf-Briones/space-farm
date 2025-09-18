import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { PlantTooltipDirective } from '../../../directives/plant-tooltip.directive';
import { WaterLevelColorPipe } from '../../../pipes/water-level-color.pipe';
import { PlantHealthStatusPipe } from '../../../pipes/plant-health-status.pipe';
import { NasaDataService } from '../../../services/nasa-data.service'; 
import { AIRecommendation, Plant, Notification, WeatherData, ScheduleForm } from '../../../interfaces/plants.interfaces';

// Importaciones locales 

@Component({
  selector: 'app-layout-riego',
    imports: [
      CommonModule, 
      FormsModule, 
      HttpClientModule,
      PlantTooltipDirective,
      PlantHealthStatusPipe,
    ],
  templateUrl: './layout-riego.component.html',
  styleUrl: './layout-riego.component.scss'
})
export class LayoutRiegoComponent  implements OnInit, OnDestroy {
  
    // Modal de programación
    scheduleForm: ScheduleForm = {
      type: 'manual',
      frequency: 'daily',
      startTime: '06:00',
      duration: 30
    };
  // Configuración básica
  selectedPlant: Plant | null = null;

  // Datos meteorológicos
  weatherData: WeatherData = {
    temperature: 24.2,
    humidity: 68,
    windSpeed: 12.3,
    uvIndex: 6.2,
    pressure: 1013,
    visibility: 15,
    alerts: ['Sequía prevista en 3 días', 'Lluvia intensa el viernes']
  };

  // Recomendaciones de IA
  aiRecommendations: AIRecommendation[] = [
    {
      type: 'warning',
      message: 'Niveles críticos de agua en sector norte. Riego inmediato recomendado.',
      priority: 1,
      confidence: 0.92
    },
    {
      type: 'info',
      message: 'Condiciones óptimas para crecimiento detectadas en 2 días.',
      priority: 2,
      confidence: 0.78
    }
  ];
  plants: Plant[] = [];

  // Insights de IA
  aiInsights: string[] = [
    'Sector norte requiere riego en 6 horas',
    'Condiciones óptimas para siembra mañana',
    'Riesgo de plagas bajo (12% probabilidad)',
    'Eficiencia de riego actual: 87%'
  ];


  gridSize = 8;
  // Control de IA
  isAnalyzing = false;
  private aiAnalysisInterval?: Subscription;
  private weatherUpdateInterval?: Subscription;
    // Tipos de plantas disponibles
    plantTypes = [
      { name: 'Tomate', icon: '🍅', waterNeed: 70 },
      { name: 'Lechuga', icon: '🥬', waterNeed: 60 },
      { name: 'Zanahoria', icon: '🥕', waterNeed: 50 },
      { name: 'Pimiento', icon: '🌶️', waterNeed: 65 },
      { name: 'Maíz', icon: '🌽', waterNeed: 75 },
      { name: 'Brócoli', icon: '🥦', waterNeed: 55 },
      { name: 'Pepino', icon: '🥒', waterNeed: 80 },
      { name: 'Cebolla', icon: '🧅', waterNeed: 45 }
    ];

    showScheduleModal = false;
  autoModeEnabled = false;
  // Notificaciones
  notifications: Notification[] = [];

  // Estadísticas de temporada
  private seasonStartDate = new Date('2024-03-01');
  private seasonEndDate = new Date('2024-11-30');

  constructor(private nasaDataService: NasaDataService) {}

  ngOnInit(): void { 
    this.startWeatherUpdates();
    this.initializeAI();
  }

  ngOnDestroy(): void {
    this.aiAnalysisInterval?.unsubscribe();
    this.weatherUpdateInterval?.unsubscribe();
  }


  // Obtener planta en posición específica
  getPlantAt(row: number, col: number): Plant | null {
    const plant = this.plants.find(p => p.position.row === row && p.position.col === col);
    return plant ?? null;
  }

  // Determinar color de celda basado en nivel de agua
  getCellColor(plant: Plant | null): string {
    if (!plant) return '#4A5568'; // Gris oscuro para celdas vacías
    
    const waterLevel = plant.waterLevel;
    if (waterLevel < 25) return '#1A365D'; // Azul muy oscuro - poca agua
    if (waterLevel < 50) return '#2C5282'; // Azul oscuro
    if (waterLevel < 75) return '#3182CE'; // Azul medio
    return '#63B3ED'; // Azul claro - mucha agua
  }


  getUVIndexColor(uvIndex: number): string {
    if (uvIndex < 3) return '#38A169';
    if (uvIndex < 6) return '#D69E2E';
    if (uvIndex < 8) return '#DD6B20';
    return '#E53E3E';
  }

  // Estadísticas del sistema
  getTotalPlants(): number {
    return this.plants.length;
  }

  getHealthyPlants(): number {
    return this.plants.filter(p => {
      const avgHealth = (p.waterLevel + p.health + p.growth) / 3;
      return avgHealth >= 70 && p.waterLevel >= 30;
    }).length;
  }

  getCriticalPlants(): number {
    return this.plants.filter(p => 
      p.waterLevel < 20 || p.health < 30
    ).length;
  }

  getAverageWaterLevel(): number {
    if (this.plants.length === 0) return 0;
    const total = this.plants.reduce((sum, plant) => sum + plant.waterLevel, 0);
    return total / this.plants.length;
  }

  getEstimatedHarvest(): number {
    return this.plants.reduce((sum, plant) => sum + plant.expectedYield, 0);
  }

  getDaysToNextHarvest(): number {
    if (this.plants.length === 0) return 0;
    return Math.min(...this.plants.map(p => p.daysToHarvest));
  }

  getHealthyPlantsColor(): string {
    const percentage = (this.getHealthyPlants() / this.getTotalPlants()) * 100;
    if (percentage >= 80) return '#38A169';
    if (percentage >= 60) return '#D69E2E';
    return '#E53E3E';
  }

  getCriticalPlantsColor(): string {
    const criticalCount = this.getCriticalPlants();
    if (criticalCount === 0) return '#38A169';
    if (criticalCount <= 2) return '#D69E2E';
    return '#E53E3E';
  }

  // Progreso de temporada
  getSeasonProgress(): number {
    const now = new Date();
    const totalDays = Math.ceil((this.seasonEndDate.getTime() - this.seasonStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((now.getTime() - this.seasonStartDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
  }

  getCurrentSeasonDay(): number {
    const now = new Date();
    return Math.max(1, Math.ceil((now.getTime() - this.seasonStartDate.getTime()) / (1000 * 60 * 60 * 24)));
  }

  getTotalSeasonDays(): number {
    return Math.ceil((this.seasonEndDate.getTime() - this.seasonStartDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Control de IA
  private initializeAI() {
    // Ejecutar análisis inicial
    setTimeout(() => this.runAIAnalysis(), 2000);
  }

  runAIAnalysis() {
    if (this.isAnalyzing) return;
    
    this.isAnalyzing = true;
    /* this.addNotification('info', 'Iniciando análisis de IA...'); */

    // Simular análisis
    setTimeout(() => {
      this.updateAIRecommendations();
      this.updateAIInsights();
      this.isAnalyzing = false;
      /* this.addNotification('success', 'Análisis de IA completado'); */
    }, 3000);
  }

  toggleAutoMode() {
    this.autoModeEnabled = !this.autoModeEnabled;
    
    if (this.autoModeEnabled) {
      this.startAutoAnalysis();
      /* this.addNotification('success', 'Modo automático activado'); */
    } else {
      this.stopAutoAnalysis();
      /* this.addNotification('info', 'Modo automático desactivado'); */
    }
  }

  private startAutoAnalysis() {
    this.aiAnalysisInterval = interval(300000).subscribe(() => { // Cada 5 minutos
      this.runAIAnalysis();
    });
  }

  private stopAutoAnalysis() {
    this.aiAnalysisInterval?.unsubscribe();
  }

  private updateAIRecommendations() {
    // Generar nuevas recomendaciones basadas en estado actual
    this.aiRecommendations = [
      {
        type: 'warning',
        message: `${this.getCriticalPlants()} plantas requieren atención inmediata`,
        priority: 1,
        confidence: 0.89
      },
      {
        type: 'info',
        message: `Eficiencia de agua actual: ${this.getWaterEfficiency()}%`,
        priority: 2,
        confidence: 0.95
      }
    ];
  }

  private updateAIInsights() {
    const avgWater = this.getAverageWaterLevel();
    const criticalCount = this.getCriticalPlants();
    const healthyCount = this.getHealthyPlants();

    this.aiInsights = [
      `Nivel promedio de agua: ${avgWater.toFixed(1)}%`,
      `${healthyCount} plantas en estado óptimo`,
      `${criticalCount} plantas requieren atención`,
      `Próxima cosecha en ${this.getDaysToNextHarvest()} días`
    ];
  }

  private getWaterEfficiency(): number {
    const avgWater = this.getAverageWaterLevel();
    const healthyPlants = this.getHealthyPlants();
    const totalPlants = this.getTotalPlants();
    
    if (totalPlants === 0) return 0;
    
    const healthRatio = healthyPlants / totalPlants;
    const waterOptimality = Math.max(0, 100 - Math.abs(avgWater - 65)); // 65% es óptimo
    
    return Math.round((healthRatio * 0.6 + waterOptimality * 0.4));
  }

  // Actualizaciones meteorológicas
  private startWeatherUpdates() {
    this.weatherUpdateInterval = interval(30000).subscribe(() => {
      this.updateWeatherData();
    });
  }

  private updateWeatherData() {
    // Simular pequeñas variaciones
    this.weatherData.temperature += (Math.random() - 0.5) * 2;
    this.weatherData.humidity += (Math.random() - 0.5) * 5;
    this.weatherData.windSpeed += (Math.random() - 0.5) * 3;
    this.weatherData.uvIndex += (Math.random() - 0.5) * 0.5;
    
    // Mantener valores en rangos realistas
    this.weatherData.temperature = Math.max(5, Math.min(45, this.weatherData.temperature));
    this.weatherData.humidity = Math.max(20, Math.min(95, this.weatherData.humidity));
    this.weatherData.windSpeed = Math.max(0, Math.min(50, this.weatherData.windSpeed));
    this.weatherData.uvIndex = Math.max(0, Math.min(12, this.weatherData.uvIndex));
  }

  // NASA Data Center
  openNasaDataCenter() {
    window.open('https://earthdata.nasa.gov/', '_blank');
  }

  
  // Manejar hover sobre celdas
  onCellHover(plant: Plant | null) {
    this.selectedPlant = plant || null;
  }
  // Manejar click en celdas
  onCellClick(plant: Plant | null) {
    if (plant) {
      this.selectedPlant = plant;
      this.waterPlant(plant);
    }
  }
  // Regar planta específica
  waterPlant(plant: Plant) {
    const oldWaterLevel = plant.waterLevel;
    plant.waterLevel = Math.min(100, plant.waterLevel + 20);
    plant.health = Math.min(100, plant.health + 5);
    
    if (plant.waterLevel > oldWaterLevel) {
      /* this.addNotification('success', `${plant.type} regado exitosamente (+${plant.waterLevel - oldWaterLevel}% agua)`); */
    }
  }


  // Obtener icono de planta
  getPlantIcon(plant: Plant): string {
    const plantType = this.plantTypes.find(t => t.name === plant.type);
    return plantType ? plantType.icon : '🌱';
  }
  
  // Modal de programación
  private openScheduleModal() {
    this.showScheduleModal = true;
  }

  closeScheduleModal() {
    this.showScheduleModal = false;
  }


  saveSchedule() {
    // Guardar programación (aquí se integraría con backend)
    console.log('Programación guardada:', this.scheduleForm);
    /* this.addNotification('success', 'Programación de riego guardada exitosamente'); */
    /* this.closeScheduleModal(); */
  } 
}