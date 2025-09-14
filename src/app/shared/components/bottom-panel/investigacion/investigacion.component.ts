import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AIRecommendation, CropPrediction, OptimizationSuggestion, ResearchReport, SoilAnalysis, SustainabilityMetric } from '../../../interfaces/research.interface';
import { ResearchService } from '../../../../core/services/research.service';
import { PlotService } from '../../../../core/services/plot.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-investigacion',
  imports: [],
  templateUrl: './investigacion.component.html',
  styleUrl: './investigacion.component.scss'
})
export class InvestigacionComponent  implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  activeTab: string = 'soil-analysis';
  selectedPlots: string[] = [];
  loading = false;
  
  soilAnalyses: SoilAnalysis[] = [];
  predictions: CropPrediction[] = [];
  optimizationSuggestions: OptimizationSuggestion[] = [];
  sustainabilityMetrics: SustainabilityMetric[] = [];
  reports: ResearchReport[] = [];
  aiRecommendations: AIRecommendation[] = [];

  tabs = [
    { id: 'soil-analysis', name: 'Análisis Suelo', icon: '🧪' },
    { id: 'predictions', name: 'Predicción', icon: '📈' },
    { id: 'optimization', name: 'Optimizar', icon: '⚡' },
    { id: 'sustainability', name: 'Sostenibilidad', icon: '🌱' },
    { id: 'reports', name: 'Reportes', icon: '📊' },
    { id: 'ai-agricola', name: 'IA Agrícola', icon: '🤖' }
  ];

  constructor(
    private researchService: ResearchService,
    private plotService: PlotService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onActionClick(action: string): void {
    
  }

  private loadInitialData(): void {
    this.loading = true;
    
    // Cargar datos según la pestaña activa
    this.loadDataForTab(this.activeTab);
  }

  private loadDataForTab(tab: string): void {
    switch (tab) {
      case 'soil-analysis':
        this.loadSoilAnalyses();
        break;
      case 'predictions':
        this.loadPredictions();
        break;
      case 'optimization':
        this.loadOptimizationSuggestions();
        break;
      case 'sustainability':
        this.loadSustainabilityMetrics();
        break;
      case 'reports':
        this.loadReports();
        break;
      case 'ai-agricola':
        this.loadAIRecommendations();
        break;
    }
  }

  switchTab(tabId: string): void {
    this.activeTab = tabId;
    this.loadDataForTab(tabId);
  }

  private loadSoilAnalyses(): void {
    this.researchService.getSoilAnalyses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analyses) => {
          this.soilAnalyses = analyses;
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.showError('Error cargando análisis de suelo');
          this.loading = false;
        }
      });
  }

  private loadPredictions(): void {
    this.researchService.getPredictions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (predictions) => {
          this.predictions = predictions;
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.showError('Error cargando predicciones');
          this.loading = false;
        }
      });
  }

  private loadOptimizationSuggestions(): void {
    if (this.selectedPlots.length === 0) {
      this.loading = false;
      return;
    }

    this.researchService.getOptimizationSuggestions(this.selectedPlots)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (suggestions) => {
          this.optimizationSuggestions = suggestions;
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.showError('Error cargando sugerencias de optimización');
          this.loading = false;
        }
      });
  }

  private loadSustainabilityMetrics(): void {
    this.researchService.getSustainabilityMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (metrics) => {
          this.sustainabilityMetrics = metrics;
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.showError('Error cargando métricas de sostenibilidad');
          this.loading = false;
        }
      });
  }

  private loadReports(): void {
    this.researchService.getReports()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reports) => {
          this.reports = reports;
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.showError('Error cargando reportes');
          this.loading = false;
        }
      });
  }

  private loadAIRecommendations(): void {
    if (this.selectedPlots.length === 0) {
      this.loading = false;
      return;
    }

    this.researchService.getAIRecommendations(this.selectedPlots)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (recommendations) => {
          this.aiRecommendations = recommendations;
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.showError('Error cargando recomendaciones de IA');
          this.loading = false;
        }
      });
  }

  // Métodos de acciones
  analyzeSoil(plotId: string): void {
    this.loading = true;
    this.researchService.analyzeSoil(plotId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analysis) => {
          this.notificationService.showSuccess('Análisis de suelo completado');
          this.loadSoilAnalyses();
        },
        error: (error) => {
          this.notificationService.showError('Error en análisis de suelo');
          this.loading = false;
        }
      });
  }

  generatePrediction(plotId: string, cropType: string): void {
    this.loading = true;
    this.researchService.generatePrediction(plotId, cropType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (prediction) => {
          this.notificationService.showSuccess('Predicción generada exitosamente');
          this.loadPredictions();
        },
        error: (error) => {
          this.notificationService.showError('Error generando predicción');
          this.loading = false;
        }
      });
  }

  implementOptimization(suggestionId: string): void {
    this.loading = true;
    this.researchService.implementOptimization(suggestionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Optimización implementada');
          this.loadOptimizationSuggestions();
        },
        error: (error) => {
          this.notificationService.showError('Error implementando optimización');
          this.loading = false;
        }
      });
  }

  generateReport(type: string): void {
    if (this.selectedPlots.length === 0) {
      this.notificationService.showWarning('Selecciona al menos una parcela');
      return;
    }

    this.loading = true;
    const dateRange = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
      end: new Date()
    };

    this.researchService.generateReport(type, this.selectedPlots, dateRange)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (report) => {
          this.notificationService.showSuccess('Reporte generado exitosamente');
          this.loadReports();
        },
        error: (error) => {
          this.notificationService.showError('Error generando reporte');
          this.loading = false;
        }
      });
  }

  exportReport(reportId: string, format: 'pdf' | 'excel' | 'csv'): void {
    this.researchService.exportReport(reportId, format)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `report_${reportId}.${format}`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          this.notificationService.showError('Error exportando reporte');
        }
      });
  }

  onPlotSelectionChange(selectedPlots: string[]): void {
    this.selectedPlots = selectedPlots;
    if (this.activeTab === 'optimization' || this.activeTab === 'ai-agricola') {
      this.loadDataForTab(this.activeTab);
    }
  }
}
