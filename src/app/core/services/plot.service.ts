import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Plot {
  id: string;
  name: string;
  size: number;
  cropType: string;
  status: 'active' | 'inactive' | 'harvesting';
  coordinates: { x: number; y: number };
  soilType: string;
  irrigationSystem: string;
  lastUpdate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PlotService {
  private apiUrl = 'api/plots';
  private plotsSubject = new BehaviorSubject<Plot[]>([]);
  
  public plots$ = this.plotsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadPlots();
  }

  private loadPlots(): void {
    this.http.get<Plot[]>(this.apiUrl).subscribe({
      next: (plots) => this.plotsSubject.next(plots),
      error: (error) => console.error('Error loading plots:', error)
    });
  }

  getPlots(): Observable<Plot[]> {
    return this.plots$;
  }

  getPlotById(id: string): Observable<Plot> {
    return this.http.get<Plot>(`${this.apiUrl}/${id}`);
  }

  updatePlot(plot: Plot): Observable<Plot> {
    return this.http.put<Plot>(`${this.apiUrl}/${plot.id}`, plot);
  }
}