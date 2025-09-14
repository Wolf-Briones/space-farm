import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SoilAnalysis } from '../../../../interfaces/research.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-soild-analysis',
  imports: [ CommonModule],
  templateUrl: './soild-analysis.component.html',
  styleUrl: './soild-analysis.component.scss'
})
export class SoildAnalysisComponent {
  @Input() analyses: SoilAnalysis[] = [];
  @Input() loading = false;
  @Output() analyzeRequested = new EventEmitter<string>();

  startAnalysis(): void {
    // Aquí podrías abrir un modal para seleccionar la parcela
    // Por ahora emitimos con una parcela por defecto
    this.analyzeRequested.emit('plot-1');
  }

  getPhStatus(ph: number): string {
    if (ph < 6.0) return 'acidic';
    if (ph > 7.5) return 'alkaline';
    return 'optimal';
  }
}
