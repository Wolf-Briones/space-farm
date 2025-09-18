 import { Directive, Input, ElementRef, HostListener, Renderer2, OnDestroy } from '@angular/core';

interface Plant {
  id: number;
  type: string;
  waterLevel: number;
  health: number;
  growth: number;
  daysToHarvest: number;
  expectedYield: number;
  position: { row: number; col: number };
}

@Directive({
  selector: '[appPlantTooltip]',
  standalone: true
})
export class PlantTooltipDirective implements OnDestroy {
  @Input('appPlantTooltip') tooltipData: Plant | null = null;
  
  private tooltipElement: HTMLElement | null = null;
  private isVisible = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent) {
    if (this.tooltipData && !this.isVisible) {
      this.showTooltip(event);
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.hideTooltip();
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.tooltipElement && this.isVisible) {
      this.updateTooltipPosition(event);
    }
  }

  private showTooltip(event: MouseEvent) {
    this.createTooltip();
    this.updateTooltipPosition(event);
    this.isVisible = true;
  }

  private hideTooltip() {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
      this.isVisible = false;
    }
  }

  private createTooltip() {
    if (!this.tooltipData) return;

    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'plant-tooltip');
    
    const tooltipContent = `
      <div class="tooltip-header">
        <div class="plant-icon">${this.getPlantIcon(this.tooltipData.type)}</div>
        <div class="plant-name">${this.tooltipData.type}</div>
      </div>
      <div class="tooltip-stats">
        <div class="stat-row">
          <span class="stat-label">💧 Agua:</span>
          <span class="stat-value" style="color: ${this.getWaterColor(this.tooltipData.waterLevel)}">${this.tooltipData.waterLevel}%</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">❤️ Salud:</span>
          <span class="stat-value" style="color: ${this.getHealthColor(this.tooltipData.health)}">${this.tooltipData.health}%</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">🌱 Crecimiento:</span>
          <span class="stat-value" style="color: ${this.getGrowthColor(this.tooltipData.growth)}">${this.tooltipData.growth}%</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">📅 Cosecha:</span>
          <span class="stat-value">${this.tooltipData.daysToHarvest} días</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">⚖️ Rendimiento:</span>
          <span class="stat-value">${this.tooltipData.expectedYield.toFixed(1)} kg/m²</span>
        </div>
      </div>
      <div class="tooltip-actions">
        <small>Click para regar</small>
      </div>
    `;

    this.renderer.setProperty(this.tooltipElement, 'innerHTML', tooltipContent);
    this.applyTooltipStyles();
    this.renderer.appendChild(document.body, this.tooltipElement);
  }

  private applyTooltipStyles() {
    if (!this.tooltipElement) return;

    const styles = {
      'position': 'absolute',
      'background': 'linear-gradient(135deg, rgba(26, 32, 46, 0.95), rgba(22, 33, 62, 0.95))',
      'border': '1px solid rgba(0, 212, 170, 0.5)',
      'border-radius': '12px',
      'padding': '16px',
      'color': '#ffffff',
      'font-family': '"Segoe UI", sans-serif',
      'font-size': '13px',
      'z-index': '10000',
      'pointer-events': 'none',
      'backdrop-filter': 'blur(10px)',
      'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.4)',
      'min-width': '200px',
      'max-width': '280px'
    };

    Object.entries(styles).forEach(([property, value]) => {
      this.renderer.setStyle(this.tooltipElement, property, value);
    });

    this.addInternalStyles();
  }

  private addInternalStyles() {
    const styleElement = this.renderer.createElement('style');
    this.renderer.setProperty(styleElement, 'textContent', `
      .plant-tooltip .tooltip-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(0, 212, 170, 0.3);
      }
      .plant-tooltip .plant-icon {
        font-size: 18px;
      }
      .plant-tooltip .plant-name {
        font-weight: 600;
        color: #00d4aa;
      }
      .plant-tooltip .tooltip-stats {
        margin-bottom: 12px;
      }
      .plant-tooltip .stat-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }
      .plant-tooltip .stat-label {
        color: #a0aec0;
        font-size: 12px;
      }
      .plant-tooltip .stat-value {
        font-weight: 600;
        font-size: 12px;
      }
      .plant-tooltip .tooltip-actions {
        padding-top: 8px;
        border-top: 1px solid rgba(0, 212, 170, 0.3);
        text-align: center;
      }
      .plant-tooltip .tooltip-actions small {
        color: #68d391;
        font-size: 11px;
      }
    `);
    this.renderer.appendChild(document.head, styleElement);
  }

  private updateTooltipPosition(event: MouseEvent) {
    if (!this.tooltipElement) return;

    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = event.clientX + 15;
    let top = event.clientY - 10;

    if (left + tooltipRect.width > viewportWidth) {
      left = event.clientX - tooltipRect.width - 15;
    }

    if (top + tooltipRect.height > viewportHeight) {
      top = event.clientY - tooltipRect.height - 10;
    }

    left = Math.max(10, left);
    top = Math.max(10, top);

    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
  }

  private getPlantIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'Tomate': '🍅',
      'Lechuga': '🥬', 
      'Zanahoria': '🥕',
      'Pimiento': '🌶️',
      'Maíz': '🌽',
      'Brócoli': '🥦',
      'Pepino': '🥒',
      'Cebolla': '🧅'
    };
    return icons[type] || '🌱';
  }

  private getWaterColor(waterLevel: number): string {
    if (waterLevel < 25) return '#E53E3E';
    if (waterLevel < 50) return '#DD6B20';
    if (waterLevel < 75) return '#D69E2E';
    return '#3182CE';
  }

  private getHealthColor(health: number): string {
    if (health < 25) return '#E53E3E';
    if (health < 50) return '#DD6B20';
    if (health < 75) return '#D69E2E';
    return '#38A169';
  }

  private getGrowthColor(growth: number): string {
    if (growth < 25) return '#E53E3E';
    if (growth < 50) return '#DD6B20';
    if (growth < 75) return '#D69E2E';
    return '#00d4aa';
  }

  ngOnDestroy() {
    this.hideTooltip();
  }
}
