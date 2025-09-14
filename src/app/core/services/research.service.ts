import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AIRecommendation, CropPrediction, OptimizationSuggestion, ResearchReport, SoilAnalysis, SustainabilityMetric } from '../../shared/interfaces/research.interface';

@Injectable({
  providedIn: 'root'
})
export class ResearchService {
  private apiUrl = 'api/research';
  private soilAnalysisSubject = new BehaviorSubject<SoilAnalysis[]>([]);
  private predictionsSubject = new BehaviorSubject<CropPrediction[]>([]);

  public soilAnalysis$ = this.soilAnalysisSubject.asObservable();
  public predictions$ = this.predictionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Análisis de Suelo
  analyzeSoil(plotId: string): Observable<SoilAnalysis> {
    return this.http.post<SoilAnalysis>(`${this.apiUrl}/soil-analysis`, { plotId })
      .pipe(
        map(analysis => {
          const currentAnalyses = this.soilAnalysisSubject.value;
          this.soilAnalysisSubject.next([...currentAnalyses, analysis]);
          return analysis;
        })
      );
  }

  getSoilAnalyses(plotId?: string): Observable<SoilAnalysis[]> {
    const params = plotId ? `?plotId=${plotId}` : '';
    return this.http.get<SoilAnalysis[]>(`${this.apiUrl}/soil-analysis${params}`);
  }

  // Predicciones
  generatePrediction(plotId: string, cropType: string): Observable<CropPrediction> {
    return this.http.post<CropPrediction>(`${this.apiUrl}/predictions`, { 
      plotId, 
      cropType 
    }).pipe(
      map(prediction => {
        const currentPredictions = this.predictionsSubject.value;
        this.predictionsSubject.next([...currentPredictions, prediction]);
        return prediction;
      })
    );
  }

  getPredictions(plotId?: string): Observable<CropPrediction[]> {
    const params = plotId ? `?plotId=${plotId}` : '';
    return this.http.get<CropPrediction[]>(`${this.apiUrl}/predictions${params}`);
  }

  // Optimización
  getOptimizationSuggestions(plotIds: string[]): Observable<OptimizationSuggestion[]> {
    return this.http.post<OptimizationSuggestion[]>(`${this.apiUrl}/optimize`, { 
      plotIds 
    });
  }

  implementOptimization(suggestionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/optimize/${suggestionId}/implement`, {});
  }

  // Sostenibilidad
  getSustainabilityMetrics(): Observable<SustainabilityMetric[]> {
    return this.http.get<SustainabilityMetric[]>(`${this.apiUrl}/sustainability`);
  }

  updateSustainabilityTarget(metricId: string, newTarget: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/sustainability/${metricId}`, { 
      targetValue: newTarget 
    });
  }

  // Reportes
  generateReport(type: string, plotIds: string[], dateRange: any): Observable<ResearchReport> {
    return this.http.post<ResearchReport>(`${this.apiUrl}/reports`, {
      type,
      plotIds,
      dateRange
    });
  }

  getReports(): Observable<ResearchReport[]> {
    return this.http.get<ResearchReport[]>(`${this.apiUrl}/reports`);
  }

  exportReport(reportId: string, format: 'pdf' | 'excel' | 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/${reportId}/export?format=${format}`, {
      responseType: 'blob'
    });
  }

  // IA Agrícola
  getAIRecommendations(plotIds: string[]): Observable<AIRecommendation[]> {
    return this.http.post<AIRecommendation[]>(`${this.apiUrl}/ai-recommendations`, {
      plotIds
    });
  }

  trainAIModel(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ai-train`, data);
  }
}