
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { CropInfo, FarmPlot, Resource, SatelliteData } from '../../shared/interfaces/interfaces.test';
import { slideInAnimation } from '../../shared/const/slide.animation';
import { plotConfigurationsConst } from '../../shared/const/plot.configuration';
import { BottomPanelComponent } from '../../shared/components/bottom-panel/bottom-panel.component';
import { RightPanelComponent } from '../../shared/components/right-panel/right-panel.component';
import { LayoutComponent } from '../../shared/components/layout/layout.component';

@Component({
  selector: 'app-game',
  imports: [ CommonModule, BottomPanelComponent, RightPanelComponent, 
    LayoutComponent
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  animations: [slideInAnimation],
  encapsulation: ViewEncapsulation.None 
})
export class GameComponent  implements OnInit, OnDestroy {
  title = 'SpaceFarm';
  
  resources: Resource[] = [
    { type: 'water', value: '1,250 L', icon: 'water' },
    { type: 'energy', value: '850 kW', icon: 'energy' },
    { type: 'biomass', value: '2,100 kg', icon: 'biomass' },
    { type: 'research', value: '45 pts', icon: 'research' }
  ];

  satelliteData: SatelliteData = {
    soilHumidity: 78,
    vegetationIndex: 0.65,
    soilTemperature: 22,
    precipitation: 12
  };


  farmPlots: FarmPlot[] = [];
  notification: string = 'Riego automático activado en Sector B';
  showNotification: boolean = true;

  private humiditySubscription?: Subscription;

  ngOnInit() {
    this.initializeFarmPlots();
    this.startHumiditySimulation();
    
    // Ocultar notificación después de 3 segundos
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  ngOnDestroy() {
    if (this.humiditySubscription) {
      this.humiditySubscription.unsubscribe();
    }
  }

  initializeFarmPlots() {
    const plotConfigurations = plotConfigurationsConst;

    this.farmPlots = plotConfigurations.map((config, index) => ({
      id: index,
      ...config
    }));
  }

  startHumiditySimulation() {
    this.humiditySubscription = interval(5000).subscribe(() => {
      const change = Math.floor(Math.random() * 6) - 3;
      this.satelliteData.soilHumidity = Math.max(0, Math.min(100, this.satelliteData.soilHumidity + change));
    });
  }

  onPlotClick(plot: FarmPlot) {
    if (!plot.planted) {
      plot.planted = true;
      plot.cropIcon = '🌱';
      
      this.notification = '🌱 Semilla plantada exitosamente';
      this.showNotification = true;
      
      setTimeout(() => {
        this.showNotification = false;
      }, 3000);
    }
  }

  onActionClick(action: string) {
    // Simular efecto de click
    console.log(`Acción ejecutada: ${action}`);
    
    // Aquí puedes agregar la lógica específica para cada acción
    this.notification = `✅ ${action} ejecutado`;
    this.showNotification = true;
    
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  getResourceIconClass(type: string): string {
    return `resource-icon ${type}`;
  }

  getPlotClasses(plot: FarmPlot): string {
    let classes = 'farm-plot';
    if (plot.planted) classes += ' planted';
    if (plot.irrigated) classes += ' irrigated';
    return classes;
  }
}