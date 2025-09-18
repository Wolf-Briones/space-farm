// src/app/shared/components/right-panel/crop-info/crop-info.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf
import { FirebaseCropService } from '../../../../core/services/firebase-crop.service';
import { CropInfo } from '../../../interfaces/crop.interface';
import { toSignal } from '@angular/core/rxjs-interop'; // Para convertir Observable a Signal

@Component({
  selector: 'app-crop-info',
  standalone: true, // Asumo que es standalone
  imports: [CommonModule],
  templateUrl: './crop-info.component.html',
  styleUrls: ['./crop-info.component.scss']
})
export class CropInfoComponent implements OnInit {

  private cropService = inject(FirebaseCropService);

  // Signals para el estado reactivo
  cropData = signal<CropInfo | null>(null);
  loading = toSignal(this.cropService.loading$, { initialValue: false }); // Convertir loading$ a signal
  error = signal<string | null>(null);
  lastUpdate = signal<string | null>(null);

  ngOnInit() {
    console.log('🌱 Componente CropInfoComponent inicializado');
    this.loadCropInfo();

    // Suscribirse a los cambios en el servicio para actualizar cropData
    this.cropService.crops$.subscribe({
      next: (crops) => {
        if (crops.length > 0) {
          // Si seleccionamos una parcela, deberías pasar ese ID al servicio
          // Por ahora, tomaremos el primer cultivo como ejemplo, o el que esté "seleccionado"
          this.cropData.set(crops[0]); // Aquí podríamos implementar la lógica para el cultivo seleccionado
          this.lastUpdate.set(new Date().toLocaleString());
          this.error.set(null); // Limpiar error si los datos se cargan correctamente
        } else {
          this.cropData.set(null);
          this.lastUpdate.set(null);
        }
      },
      error: (err) => {
        console.error('❌ Error en la suscripción de cultivos:', err);
        this.handleError(err);
      }
    });
  }

  /**
   * Carga los datos iniciales o refresca la lista de cultivos.
   */
  loadCropInfo(): void {
    // El servicio FirebaseCropService ya gestiona su propio estado de carga
    // y emitirá los datos a través de crops$.
    this.error.set(null); // Limpiar error antes de intentar cargar
    this.cropService.getAllCrops().subscribe({
      error: (err) => {
        this.handleError(err);
        this.loadFallbackData(); // Cargar datos de fallback en caso de error inicial
      }
    });
  }

  /**
   * Simula una actualización del progreso de crecimiento (ejecutar desde un botón de prueba).
   */
  updateProgress(): void {
    if (this.cropData()?.id) {
      const currentGrowth = this.cropData()!.crecimiento;
      const newProgress = Math.min(100, currentGrowth + 5);
      this.cropService.updateGrowthProgress(this.cropData()!.id!, newProgress);
      // El crops$ del servicio debería emitir la actualización, lo que refrescará cropData
    }
  }

  /**
   * Recarga los datos del servicio.
   */
  refreshData(): void {
    console.log('🔄 Refrescando datos de información del cultivo...');
    this.loadCropInfo();
  }

  /**
   * Carga datos predeterminados (fallback) cuando falla la carga principal.
   */
  private loadFallbackData(): void {
    console.log('🆘 Cargando datos de cultivo predeterminados...');
    this.cropData.set({
      id: 'fallback-crop',
      tipo: 'Cultivo Desconocido',
      crecimiento: 0,
      salud: 'N/A' as any, // 'N/A' no es un tipo válido en la interfaz, pero se usa para fallback
      diasParaCosecha: 0,
      rendimientoEst: 0,
      ultimaActualizacion: new Date()
    });
    this.lastUpdate.set('Datos no disponibles');
  }

  /**
   * Maneja errores y actualiza el estado.
   */
  private handleError(err: any): void {
    this.error.set(err.message || 'Error desconocido al obtener datos del cultivo.');
  }
}