import { Component, inject, OnInit } from '@angular/core'; 
import { FirebaseCropService } from '../../../../core/services/firebase-crop.service';
import { CropInfo } from '../../../interfaces/crop.interface';

@Component({
  selector: 'app-crop-info',
  imports: [],
  templateUrl: './crop-info.component.html',
  styleUrl: './crop-info.component.scss'
})
export class CropInfoComponent  implements OnInit {

  private cropService = inject(FirebaseCropService) 
  cropData: CropInfo | null = null;
  loading$ = this.cropService.loading$;
 

  ngOnInit() {
    // Obtener todos los cultivos
    this.cropService.crops$.subscribe(crops => {
      if (crops.length > 0) {
        this.cropData = crops[0]; // Tomar el primer cultivo como ejemplo
      }
    });

    // O obtener un cultivo específico
    // this.cropService.getCropById('crop-id').subscribe(crop => {
    //   this.cropData = crop;
    // });
  }

  updateProgress() {
    if (this.cropData?.id) {
      const newProgress = Math.min(100, this.cropData.crecimiento! + 5);
      this.cropService.updateGrowthProgress(this.cropData.id, newProgress);
    }
  }

  refreshData() {
    this.cropService.getAllCrops().subscribe();
  }

  // Crear datos de ejemplo (solo para testing)
  async createSampleData() {
    await this.cropService.createSampleData();
  }

  cropInfo: CropInfo = {
    tipo: 'Tomate',
    crecimiento: 75,
    salud: 'Excelente',
    diasParaCosecha: 12,
    rendimientoEst: 2.3,
    fechaPlantado: new Date('2024-08-15T00:00:00.000Z'),
    fechaEstimadaCosecha: new Date('2024-09-26T00:00:00.000Z'),
    ubicacion: {
      lat: -7.1614,
      lon: -78.5126,
      nombre: 'Parcela A'
    },
    ultimaActualizacion: new Date('2024-09-14T10:30:00.000Z')
  };
}

/* // Colección: crops
{
  "crops": {
    "crop-id-1": {
      "tipo": "Tomate",
      "crecimiento": 75,
      "salud": "Excelente",
      "diasParaCosecha": 12,
      "rendimientoEst": 2.3,
      "fechaPlantado": "2024-08-15T00:00:00.000Z",
      "fechaEstimadaCosecha": "2024-09-26T00:00:00.000Z",
      "ubicacion": {
        "lat": -7.1614,
        "lon": -78.5126,
        "nombre": "Parcela A"
      },
      "ultimaActualizacion": "2024-09-14T10:30:00.000Z"
    }
  }
}*/