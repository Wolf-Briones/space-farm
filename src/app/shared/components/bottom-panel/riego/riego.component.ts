import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';

// Importaciones locales
import { PlantTooltipDirective } from './directives/plant-tooltip.directive';
import { WaterLevelColorPipe } from './pipes/water-level-color.pipe';
import { PlantHealthStatusPipe } from './pipes/plant-health-status.pipe';
import { NasaDataService } from './services/nasa-data.service';

// Interfaces
interface Plant {
  id: number;
  type: string;
  waterLevel: number; // 0-100
  health: number; // 0-100
  growth: number; // 0-100
  daysToHarvest: number;
  expectedYield: number;
  position: { row: number; col: number };
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  pressure: number;
  visibility?: number;
  alerts: string[];
}

interface AIRecommendation {
  type: 'warning' | 'info' | 'success';
  message: string;
  priority: number;
  confidence: number;
}

interface ScheduleForm {
  type: string;
  frequency: string;
  startTime: string;
  duration: number;
}

interface Notification {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
}

@Component({
  selector: 'app-riego',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    HttpClientModule,
    PlantTooltipDirective,
    WaterLevelColorPipe,
    PlantHealthStatusPipe
  ],
  templateUrl: './riego.component.html',
  styleUrl: './riego.component.scss'
})
export class RiegoComponent implements OnInit, OnDestroy {
  // Configuración básica
  gridSize = 8;
  plants: Plant[] = [];
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

  // Insights de IA
  aiInsights: string[] = [
    'Sector norte requiere riego en 6 horas',
    'Condiciones óptimas para siembra mañana',
    'Riesgo de plagas bajo (12% probabilidad)',
    'Eficiencia de riego actual: 87%'
  ];

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

  // Control de IA
  isAnalyzing = false;
  autoModeEnabled = false;
  private aiAnalysisInterval?: Subscription;
  private weatherUpdateInterval?: Subscription;

  // Modal de programación
  showScheduleModal = false;
  scheduleForm: ScheduleForm = {
    type: 'manual',
    frequency: 'daily',
    startTime: '06:00',
    duration: 30
  };

  // Notificaciones
  notifications: Notification[] = [];

  // Estadísticas de temporada
  private seasonStartDate = new Date('2024-03-01');
  private seasonEndDate = new Date('2024-11-30');

  constructor(private nasaDataService: NasaDataService) {}

  ngOnInit(): void {
    this.generateRandomPlants();
    this.startWeatherUpdates();
    this.initializeAI();
    this.addNotification('info', 'Sistema de riego NASA iniciado correctamente');
  }

  ngOnDestroy(): void {
    this.aiAnalysisInterval?.unsubscribe();
    this.weatherUpdateInterval?.unsubscribe();
  }

  // Método original del usuario - mantener funcionalidad
  onActionClick(action: string) {
    console.log(`Acción seleccionada: ${action}`);
    
    switch (action) {
      case 'Riego Manual':
        this.executeManualIrrigation();
        break;
      case 'Auto-Riego':
        this.toggleAutoIrrigation();
        break;
      case 'Drenaje':
        this.executeDrainage();
        break;
      case 'Aspersores':
        this.activateSprinklers();
        break;
      case 'Goteo':
        this.activateDripIrrigation();
        break;
      case 'Programar':
        this.openScheduleModal();
        break;
      default:
        this.addNotification('info', `Ejecutando: ${action}`);
    }
  }

  // Generación de plantas aleatorias
  generateRandomPlants() {
    this.plants = [];
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (Math.random() > 0.25) { // 75% probabilidad de tener planta
          const plantType = this.plantTypes[Math.floor(Math.random() * this.plantTypes.length)];
          this.plants.push({
            id: row * this.gridSize + col,
            type: plantType.name,
            waterLevel: Math.floor(Math.random() * 100),
            health: Math.floor(Math.random() * 100),
            growth: Math.floor(Math.random() * 100),
            daysToHarvest: Math.floor(Math.random() * 20) + 5,
            expectedYield: Math.random() * 30 + 10,
            position: { row, col }
          });
        }
      }
    }
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

  // Obtener icono de planta
  getPlantIcon(plant: Plant): string {
    const plantType = this.plantTypes.find(t => t.name === plant.type);
    return plantType ? plantType.icon : '🌱';
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
      this.addNotification('success', `${plant.type} regado exitosamente (+${plant.waterLevel - oldWaterLevel}% agua)`);
    }
  }

  // Acciones de riego específicas
  private executeManualIrrigation() {
    if (this.selectedPlant) {
      this.waterPlant(this.selectedPlant);
    } else {
      this.addNotification('warning', 'Selecciona una planta para riego manual');
    }
  }

  private toggleAutoIrrigation() {
    this.autoModeEnabled = !this.autoModeEnabled;
    if (this.autoModeEnabled) {
      this.startAutoIrrigation();
      this.addNotification('success', 'Modo auto-riego activado');
    } else {
      this.stopAutoIrrigation();
      this.addNotification('info', 'Modo auto-riego desactivado');
    }
  }

  private executeDrainage() {
    const overWateredPlants = this.plants.filter(p => p.waterLevel > 80);
    overWateredPlants.forEach(plant => {
      plant.waterLevel = Math.max(60, plant.waterLevel - 20);
    });
    this.addNotification('info', `Drenaje aplicado a ${overWateredPlants.length} plantas`);
  }

  private activateSprinklers() {
    const affectedPlants = this.plants.filter(p => p.waterLevel < 60);
    affectedPlants.forEach(plant => {
      plant.waterLevel = Math.min(100, plant.waterLevel + 15);
    });
    this.addNotification('success', `Aspersores activados - ${affectedPlants.length} plantas regadas`);
  }

  private activateDripIrrigation() {
    const criticalPlants = this.plants.filter(p => p.waterLevel < 30);
    criticalPlants.forEach(plant => {
      plant.waterLevel = Math.min(100, plant.waterLevel + 25);
      plant.health = Math.min(100, plant.health + 3);
    });
    this.addNotification('success', `Riego por goteo activado - ${criticalPlants.length} plantas críticas atendidas`);
  }

  // Funciones de color para diferentes métricas
  getHealthColor(health: number): string {
    if (health < 25) return '#E53E3E';
    if (health < 50) return '#DD6B20';
    if (health < 75) return '#D69E2E';
    return '#38A169';
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
    this.addNotification('info', 'Iniciando análisis de IA...');

    // Simular análisis
    setTimeout(() => {
      this.updateAIRecommendations();
      this.updateAIInsights();
      this.isAnalyzing = false;
      this.addNotification('success', 'Análisis de IA completado');
    }, 3000);
  }

  toggleAutoMode() {
    this.autoModeEnabled = !this.autoModeEnabled;
    
    if (this.autoModeEnabled) {
      this.startAutoAnalysis();
      this.addNotification('success', 'Modo automático activado');
    } else {
      this.stopAutoAnalysis();
      this.addNotification('info', 'Modo automático desactivado');
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

  private startAutoIrrigation() {
    // Implementar lógica de auto-riego basada en IA
    interval(600000).subscribe(() => { // Cada 10 minutos
      if (this.autoModeEnabled) {
        this.executeAutoIrrigation();
      }
    });
  }

  private stopAutoIrrigation() {
    // Detener auto-riego
  }

  private executeAutoIrrigation() {
    const criticalPlants = this.plants.filter(p => p.waterLevel < 25);
    criticalPlants.forEach(plant => this.waterPlant(plant));
    
    if (criticalPlants.length > 0) {
      this.addNotification('success', `Auto-riego: ${criticalPlants.length} plantas regadas automáticamente`);
    }
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
    this.addNotification('success', 'Programación de riego guardada exitosamente');
    this.closeScheduleModal();
  }

  // Sistema de notificaciones
  addNotification(type: Notification['type'], message: string) {
    const notification: Notification = {
      type,
      message,
      timestamp: Date.now()
    };
    
    this.notifications.push(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      this.dismissNotification(this.notifications.indexOf(notification));
    }, 5000);
  }

  dismissNotification(index: number) {
    if (index >= 0 && index < this.notifications.length) {
      this.notifications.splice(index, 1);
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  }
}