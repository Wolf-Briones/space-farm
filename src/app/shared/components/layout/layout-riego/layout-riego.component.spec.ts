import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
 
import { PlantTooltipDirective } from '../../../directives/plant-tooltip.directive';
import { WaterLevelColorPipe } from '../../../pipes/water-level-color.pipe';
import { PlantHealthStatusPipe } from '../../../pipes/plant-health-status.pipe';
import { NasaDataService } from '../../../services/nasa-data.service';
import { RiegoComponent } from '../../bottom-panel/riego/riego.component';

describe('LayoutRiegoComponent', () => {
  let component: RiegoComponent;
  let fixture: ComponentFixture<RiegoComponent>;
  let mockNasaDataService: jasmine.SpyObj<NasaDataService>;

  beforeEach(async () => {
    // Crear spy del servicio NASA
    const nasaServiceSpy = jasmine.createSpyObj('NasaDataService', [
      'getWeatherData',
      'getSoilMoistureData',
      'getAIRecommendations',
      'getWeatherAlerts'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        RiegoComponent,
        FormsModule,
        HttpClientTestingModule
      ],
      declarations: [
        PlantTooltipDirective,
        WaterLevelColorPipe,
        PlantHealthStatusPipe
      ],
      providers: [
        { provide: NasaDataService, useValue: nasaServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiegoComponent);
    component = fixture.componentInstance;
    mockNasaDataService = TestBed.inject(NasaDataService) as jasmine.SpyObj<NasaDataService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
/* 
  it('should initialize with default values', () => {
    expect(component.gridSize).toBe(8);
    expect(component.plants).toEqual(jasmine.any(Array));
    expect(component.selectedPlant).toBeNull();
    expect(component.weatherData).toBeDefined();
    expect(component.aiRecommendations).toEqual(jasmine.any(Array));
  });

  it('should handle action click', () => {
    spyOn(console, 'log');
    const action = 'Riego Manual';
    
    component.onActionClick(action);
    
    expect(console.log).toHaveBeenCalledWith(`Acción seleccionada: ${action}`);
  });

  it('should generate random plants on init', () => {
    component.ngOnInit();
    
    expect(component.plants.length).toBeGreaterThan(0);
    expect(component.plants.every(plant => 
      plant.waterLevel >= 0 && plant.waterLevel <= 100
    )).toBeTruthy();
  });

  it('should get plant at specific position', () => {
    // Agregar planta de prueba
    const testPlant = {
      id: 1,
      type: 'Tomate',
      waterLevel: 50,
      health: 80,
      growth: 60,
      daysToHarvest: 10,
      expectedYield: 15.5,
      position: { row: 2, col: 3 }
    };
    component.plants = [testPlant];

    const foundPlant = component.getPlantAt(2, 3);
    expect(foundPlant).toEqual(testPlant);

    const notFoundPlant = component.getPlantAt(0, 0);
    expect(notFoundPlant).toBeUndefined();
  });

  it('should return correct cell color based on water level', () => {
    const testPlant = {
      id: 1,
      type: 'Tomate',
      waterLevel: 30,
      health: 80,
      growth: 60,
      daysToHarvest: 10,
      expectedYield: 15.5,
      position: { row: 0, col: 0 }
    };

    // Test con planta
    const colorWithPlant = component.getCellColor(testPlant);
    expect(colorWithPlant).toBe('#2C5282'); // Azul oscuro para 30% agua

    // Test sin planta
  const colorWithoutPlant = component.getCellColor(null);
    expect(colorWithoutPlant).toBe('#4A5568'); // Gris oscuro para celdas vacías
  });

  it('should get correct plant icon', () => {
    const tomatePlant = {
      id: 1,
      type: 'Tomate',
      waterLevel: 50,
      health: 80,
      growth: 60,
      daysToHarvest: 10,
      expectedYield: 15.5,
      position: { row: 0, col: 0 }
    };

    const icon = component.getPlantIcon(tomatePlant);
    expect(icon).toBe('🍅');
  });

  it('should handle cell hover', () => {
    const testPlant = {
      id: 1,
      type: 'Tomate',
      waterLevel: 50,
      health: 80,
      growth: 60,
      daysToHarvest: 10,
      expectedYield: 15.5,
      position: { row: 0, col: 0 }
    };

    component.onCellHover(testPlant);
    expect(component.selectedPlant).toEqual(testPlant);

  component.onCellHover(null);
    expect(component.selectedPlant).toBeNull();
  });

  it('should handle cell click and water plant', () => {
    const testPlant = {
      id: 1,
      type: 'Tomate',
      waterLevel: 50,
      health: 70,
      growth: 60,
      daysToHarvest: 10,
      expectedYield: 15.5,
      position: { row: 0, col: 0 }
    };

    const initialWaterLevel = testPlant.waterLevel;
    const initialHealth = testPlant.health;

    component.onCellClick(testPlant);

    expect(testPlant.waterLevel).toBe(Math.min(100, initialWaterLevel + 20));
    expect(testPlant.health).toBe(Math.min(100, initialHealth + 5));
  });

  it('should water selected plant', () => {
    const testPlant = {
      id: 1,
      type: 'Tomate',
      waterLevel: 50,
      health: 70,
      growth: 60,
      daysToHarvest: 10,
      expectedYield: 15.5,
      position: { row: 0, col: 0 }
    };

    component.selectedPlant = testPlant;
    const initialWaterLevel = testPlant.waterLevel;

    component.waterPlant(testPlant);

    expect(testPlant.waterLevel).toBe(Math.min(100, initialWaterLevel + 20));
  });

  it('should return correct health color', () => {
    expect(component.getHealthColor(20)).toBe('#E53E3E'); // Rojo
    expect(component.getHealthColor(40)).toBe('#DD6B20'); // Naranja
    expect(component.getHealthColor(60)).toBe('#D69E2E'); // Amarillo
    expect(component.getHealthColor(90)).toBe('#38A169'); // Verde
  });

  it('should return correct UV index color', () => {
    expect(component.getUVIndexColor(2)).toBe('#38A169'); // Verde
    expect(component.getUVIndexColor(5)).toBe('#D69E2E'); // Amarillo
    expect(component.getUVIndexColor(7)).toBe('#DD6B20'); // Naranja
    expect(component.getUVIndexColor(9)).toBe('#E53E3E'); // Rojo
  });

  it('should calculate total plants correctly', () => {
    const testPlants = [
      { id: 1, type: 'Tomate', waterLevel: 50, health: 80, growth: 60, daysToHarvest: 10, expectedYield: 15.5, position: { row: 0, col: 0 } },
      { id: 2, type: 'Lechuga', waterLevel: 30, health: 60, growth: 40, daysToHarvest: 5, expectedYield: 8.2, position: { row: 1, col: 1 } }
    ];
    component.plants = testPlants;

    expect(component.getTotalPlants()).toBe(2);
  });

  it('should calculate healthy plants correctly', () => {
    const testPlants = [
      { id: 1, type: 'Tomate', waterLevel: 80, health: 90, growth: 85, daysToHarvest: 10, expectedYield: 15.5, position: { row: 0, col: 0 } },
      { id: 2, type: 'Lechuga', waterLevel: 30, health: 60, growth: 40, daysToHarvest: 5, expectedYield: 8.2, position: { row: 1, col: 1 } },
      { id: 3, type: 'Zanahoria', waterLevel: 70, health: 80, growth: 75, daysToHarvest: 15, expectedYield: 12.1, position: { row: 2, col: 2 } }
    ];
    component.plants = testPlants;

    const healthyCount = component.getHealthyPlants();
    expect(healthyCount).toBeGreaterThanOrEqual(0);
    expect(healthyCount).toBeLessThanOrEqual(3);
  });

  it('should calculate critical plants correctly', () => {
    const testPlants = [
      { id: 1, type: 'Tomate', waterLevel: 10, health: 20, growth: 15, daysToHarvest: 10, expectedYield: 15.5, position: { row: 0, col: 0 } },
      { id: 2, type: 'Lechuga', waterLevel: 80, health: 90, growth: 85, daysToHarvest: 5, expectedYield: 8.2, position: { row: 1, col: 1 } }
    ];
    component.plants = testPlants;

    const criticalCount = component.getCriticalPlants();
    expect(criticalCount).toBeGreaterThanOrEqual(0);
  });

  it('should calculate average water level correctly', () => {
    const testPlants = [
      { id: 1, type: 'Tomate', waterLevel: 60, health: 80, growth: 70, daysToHarvest: 10, expectedYield: 15.5, position: { row: 0, col: 0 } },
      { id: 2, type: 'Lechuga', waterLevel: 40, health: 60, growth: 50, daysToHarvest: 5, expectedYield: 8.2, position: { row: 1, col: 1 } }
    ];
    component.plants = testPlants;

    expect(component.getAverageWaterLevel()).toBe(50);
  });

  it('should handle AI analysis', () => {
    spyOn(component, 'addNotification');
    
    component.runAIAnalysis();
    
    expect(component.isAnalyzing).toBeTruthy();
    expect(component.addNotification).toHaveBeenCalledWith(
      'info',
      'Iniciando análisis de IA...'
    );
  });

  it('should toggle auto mode', () => {
    spyOn(component, 'addNotification');
    const initialMode = component.autoModeEnabled;
    
    component.toggleAutoMode();
    
    expect(component.autoModeEnabled).toBe(!initialMode);
    expect(component.addNotification).toHaveBeenCalled();
  });

  it('should open NASA data center', () => {
    spyOn(window, 'open');
    
    component.openNasaDataCenter();
    
    expect(window.open).toHaveBeenCalledWith(
      'https://earthdata.nasa.gov/',
      '_blank'
    );
  });

  it('should handle schedule modal', () => {
    // Test abrir modal
    component.onActionClick('Programar');
    expect(component.showScheduleModal).toBeTruthy();

    // Test cerrar modal
    component.closeScheduleModal();
    expect(component.showScheduleModal).toBeFalsy();
  });

  it('should save schedule correctly', () => {
    spyOn(component, 'addNotification');
    component.scheduleForm = {
      type: 'auto',
      frequency: 'daily',
      startTime: '06:00',
      duration: 30
    };

    component.saveSchedule();

    expect(component.showScheduleModal).toBeFalsy();
    expect(component.addNotification).toHaveBeenCalledWith(
      'success',
      'Programación de riego guardada exitosamente'
    );
  });

  it('should add and dismiss notifications', () => {
    // Test agregar notificación
    component.addNotification('success', 'Test message');
    expect(component.notifications.length).toBe(1);
    expect(component.notifications[0].type).toBe('success');
    expect(component.notifications[0].message).toBe('Test message');

    // Test dismissar notificación
    component.dismissNotification(0);
    expect(component.notifications.length).toBe(0);
  });

  it('should get correct notification icon', () => {
    expect(component.getNotificationIcon('success')).toBe('✅');
    expect(component.getNotificationIcon('warning')).toBe('⚠️');
    expect(component.getNotificationIcon('error')).toBe('❌');
    expect(component.getNotificationIcon('info')).toBe('ℹ️');
  });

  it('should update weather data over time', (done) => {
    const initialTemp = component.weatherData.temperature;
    
    // Simular paso del tiempo
    setTimeout(() => {
      // La temperatura debería haber cambiado ligeramente
      expect(component.weatherData.temperature).not.toBe(initialTemp);
      done();
    }, 100);
  });

  it('should handle empty plants array gracefully', () => {
    component.plants = [];
    
    expect(component.getTotalPlants()).toBe(0);
    expect(component.getHealthyPlants()).toBe(0);
    expect(component.getCriticalPlants()).toBe(0);
    expect(component.getAverageWaterLevel()).toBe(0);
    expect(component.getEstimatedHarvest()).toBe(0);
  }); */
});