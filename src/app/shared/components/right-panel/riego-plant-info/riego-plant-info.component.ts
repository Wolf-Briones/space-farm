import { Component } from '@angular/core'; 
import { WaterLevelColorPipe } from '../../../pipes/water-level-color.pipe'; 
import { NgIf } from '@angular/common';
import { PlantHealthStatusPipe } from '../../../pipes/plant-health-status.pipe';
import { interval } from 'rxjs';
import { Notification, Plant, ScheduleForm } from '../../../interfaces/plants.interfaces';

@Component({
  selector: 'app-riego-plant-info',
  imports: [
      WaterLevelColorPipe, NgIf, PlantHealthStatusPipe],
  templateUrl: './riego-plant-info.component.html',
  styleUrl: './riego-plant-info.component.scss'
})
export class RiegoPlantInfoComponent {
  plants: Plant[] = [];
  autoModeEnabled = false;
  
    showScheduleModal = false;
    selectedPlant: Plant | null= {
  id: 0,
  type: '',
  waterLevel: 0,
  health: 100,
  growth: 0,
  daysToHarvest: 0,
  expectedYield: 0,
  position: { row: 0, col: 0 }
};

  gridSize = 8;

  // Notificaciones
  Notifications: Notification[] = []; 
  
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

    
  // Modal de programación
  scheduleForm: ScheduleForm = {
    type: 'manual',
    frequency: 'daily',
    startTime: '06:00',
    duration: 30
  };


  ngOnInit(): void {
    this.generateRandomPlants();
    /* this.startWeatherUpdates();
    this.initializeAI(); */
    this.addNotification('info', 'Sistema de riego NASA iniciado correctamente');
  }


  // Obtener planta en posición específica
  getPlantAt(row: number, col: number): Plant | null {
    const plant = this.plants.find(p => p.position.row === row && p.position.col === col);
    return plant ?? null;
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


  // Sistema de notificaciones
  addNotification(type: Notification['type'], message: string) {
    const Notification: Notification = {
      type,
      message,
      timestamp: Date.now()
    };
    
    this.Notifications.push(Notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      this.dismissNotification(this.Notifications.indexOf(Notification));
    }, 5000);
  } 

  dismissNotification(index: number) {
    if (index >= 0 && index < this.Notifications.length) {
      this.Notifications.splice(index, 1);
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

  
  // Funciones de color para diferentes métricas
  getHealthColor(health: number): string {
    if (health < 25) return '#E53E3E';
    if (health < 50) return '#DD6B20';
    if (health < 75) return '#D69E2E';
    return '#38A169';
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

  // Modal de programación
  private openScheduleModal() {
    this.showScheduleModal = true;
  }

  closeScheduleModal() {
    this.showScheduleModal = false;
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
    /* criticalPlants.forEach(plant => this.waterPlant(plant)); */
    
    if (criticalPlants.length > 0) {
      this.addNotification('success', `Auto-riego: ${criticalPlants.length} plantas regadas automáticamente`);
    }
  }
  

  saveSchedule() {
    // Guardar programación (aquí se integraría con backend)
    console.log('Programación guardada:', this.scheduleForm);
    this.addNotification('success', 'Programación de riego guardada exitosamente');
    /* this.closeScheduleModal(); */
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
