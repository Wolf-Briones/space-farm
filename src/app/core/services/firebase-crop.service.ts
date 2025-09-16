import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy, onSnapshot, DocumentReference, CollectionReference } from '@angular/fire/firestore';
import { Observable, BehaviorSubject, throwError, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Interfaces para el tipado fuerte
export interface CropInfo {
  id?: string;
  tipo: string;
  crecimiento: number; // Porcentaje (0-100)
  salud: 'Excelente' | 'Buena' | 'Regular' | 'Mala';
  diasParaCosecha: number;
  rendimientoEst: number; // kg/m²
  fechaPlantado?: Date;
  fechaEstimadaCosecha?: Date;
  ubicacion?: {
    lat: number;
    lon: number;
    nombre?: string;
  };
  notas?: string;
  ultimaActualizacion?: Date;
  userId?: string;
}

export interface CropData {
  crops: CropInfo[];
  totalCrops: number;
  activeCrops: number;
  averageHealth: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseCropService {
  private cropsSubject = new BehaviorSubject<CropInfo[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private cropsCollection: CollectionReference;

  // Observables públicos
  crops$ = this.cropsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(private firestore: Firestore) {
    this.cropsCollection = collection(this.firestore, 'crops');
    
    // Cargar datos iniciales
    this.loadAllCrops();
  }

  /**
   * Obtiene todos los cultivos del usuario
   * @param userId ID del usuario (opcional)
   * @returns Observable con array de cultivos
   */
  getAllCrops(userId?: string): Observable<CropInfo[]> {
    this.loadingSubject.next(true);
    
    return new Observable<CropInfo[]>(subscriber => {
      let q = query(
        this.cropsCollection,
        orderBy('ultimaActualizacion', 'desc')
      );

      if (userId) {
        q = query(
          this.cropsCollection,
          where('userId', '==', userId),
          orderBy('ultimaActualizacion', 'desc')
        );
      }

      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const crops: CropInfo[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as CropInfo;
            crops.push({ id: doc.id, ...data });
          });
          
          this.cropsSubject.next(crops);
          this.loadingSubject.next(false);
          console.log('🌱 Cultivos cargados desde Firebase:', crops);
          subscriber.next(crops);
        },
        (error) => {
          console.error('❌ Error cargando cultivos:', error);
          this.loadingSubject.next(false);
          subscriber.error(error);
        }
      );

      return () => unsubscribe();
    }).pipe(
      catchError(this.handleError<CropInfo[]>('getAllCrops'))
    );
  }

  /**
   * Obtiene un cultivo específico por ID
   * @param cropId ID del cultivo
   * @returns Observable con la información del cultivo
   */
  getCropById(cropId: string): Observable<CropInfo | null> {
    this.loadingSubject.next(true);
    
    const docRef = doc(this.firestore, 'crops', cropId);
    
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        this.loadingSubject.next(false);
        if (docSnap.exists()) {
          const data = docSnap.data() as CropInfo;
          return { id: docSnap.id, ...data };
        }
        return null;
      }),
      catchError(this.handleError<CropInfo | null>('getCropById'))
    );
  }

  /**
   * Obtiene cultivos por tipo específico
   * @param tipo Tipo de cultivo
   * @returns Observable con array de cultivos del tipo especificado
   */
  getCropsByType(tipo: string): Observable<CropInfo[]> {
    const q = query(
      this.cropsCollection,
      where('tipo', '==', tipo),
      orderBy('ultimaActualizacion', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        const crops: CropInfo[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as CropInfo;
          crops.push({ id: doc.id, ...data });
        });
        return crops;
      }),
      catchError(this.handleError<CropInfo[]>('getCropsByType'))
    );
  }

  /**
   * Obtiene cultivos listos para cosechar
   * @param diasUmbral Días máximo para considerar listo para cosecha
   * @returns Observable con cultivos próximos a cosechar
   */
  getCropsReadyToHarvest(diasUmbral: number = 7): Observable<CropInfo[]> {
    return this.crops$.pipe(
      map(crops => crops.filter(crop => crop.diasParaCosecha <= diasUmbral)),
      catchError(this.handleError<CropInfo[]>('getCropsReadyToHarvest'))
    );
  }

  /**
   * Crea un nuevo cultivo
   * @param cropData Datos del cultivo
   * @returns Promise con el ID del nuevo cultivo
   */
  async createCrop(cropData: Omit<CropInfo, 'id'>): Promise<string> {
    this.loadingSubject.next(true);
    
    try {
      const newCrop: CropInfo = {
        ...cropData,
        ultimaActualizacion: new Date(),
        fechaEstimadaCosecha: this.calculateHarvestDate(cropData.diasParaCosecha)
      };

      const docRef = await addDoc(this.cropsCollection, newCrop);
      console.log('🌱 Nuevo cultivo creado con ID:', docRef.id);
      
      this.loadingSubject.next(false);
      return docRef.id;
    } catch (error) {
      this.loadingSubject.next(false);
      console.error('❌ Error creando cultivo:', error);
      throw error;
    }
  }

  /**
   * Actualiza un cultivo existente
   * @param cropId ID del cultivo
   * @param updateData Datos a actualizar
   * @returns Promise vacía
   */
  async updateCrop(cropId: string, updateData: Partial<CropInfo>): Promise<void> {
    this.loadingSubject.next(true);
    
    try {
      const docRef = doc(this.firestore, 'crops', cropId);
      const dataToUpdate = {
        ...updateData,
        ultimaActualizacion: new Date()
      };

      // Recalcular fecha de cosecha si se actualiza diasParaCosecha
      if (updateData.diasParaCosecha !== undefined) {
        dataToUpdate.fechaEstimadaCosecha = this.calculateHarvestDate(updateData.diasParaCosecha);
      }

      await updateDoc(docRef, dataToUpdate);
      console.log('🔄 Cultivo actualizado:', cropId);
      
      this.loadingSubject.next(false);
    } catch (error) {
      this.loadingSubject.next(false);
      console.error('❌ Error actualizando cultivo:', error);
      throw error;
    }
  }

  /**
   * Elimina un cultivo
   * @param cropId ID del cultivo a eliminar
   * @returns Promise vacía
   */
  async deleteCrop(cropId: string): Promise<void> {
    this.loadingSubject.next(true);
    
    try {
      const docRef = doc(this.firestore, 'crops', cropId);
      await deleteDoc(docRef);
      console.log('🗑️ Cultivo eliminado:', cropId);
      
      this.loadingSubject.next(false);
    } catch (error) {
      this.loadingSubject.next(false);
      console.error('❌ Error eliminando cultivo:', error);
      throw error;
    }
  }

  /**
   * Actualiza el progreso de crecimiento de un cultivo
   * @param cropId ID del cultivo
   * @param nuevoCrecimiento Nuevo porcentaje de crecimiento (0-100)
   * @returns Promise vacía
   */
  async updateGrowthProgress(cropId: string, nuevoCrecimiento: number): Promise<void> {
    if (nuevoCrecimiento < 0 || nuevoCrecimiento > 100) {
      throw new Error('El crecimiento debe estar entre 0 y 100%');
    }

    const diasRestantes = Math.max(0, Math.round((100 - nuevoCrecimiento) * 0.3));
    
    await this.updateCrop(cropId, {
      crecimiento: nuevoCrecimiento,
      diasParaCosecha: diasRestantes
    });
  }

  /**
   * Obtiene estadísticas generales de los cultivos
   * @returns Observable con estadísticas
   */
  getCropStatistics(): Observable<CropData> {
    return this.crops$.pipe(
      map(crops => {
        const activeCrops = crops.filter(crop => crop.crecimiento < 100).length;
        const healthScores = {
          'Excelente': 4,
          'Buena': 3,
          'Regular': 2,
          'Mala': 1
        };
        
        const averageHealthScore = crops.length > 0 
          ? crops.reduce((sum, crop) => sum + healthScores[crop.salud], 0) / crops.length
          : 0;
        
        const averageHealth = averageHealthScore >= 3.5 ? 'Excelente' :
                             averageHealthScore >= 2.5 ? 'Buena' :
                             averageHealthScore >= 1.5 ? 'Regular' : 'Mala';

        return {
          crops,
          totalCrops: crops.length,
          activeCrops,
          averageHealth
        };
      }),
      catchError(this.handleError<CropData>('getCropStatistics'))
    );
  }

  /**
   * Carga todos los cultivos (método privado)
   */
  private loadAllCrops(): void {
    this.getAllCrops().subscribe();
  }

  /**
   * Calcula la fecha estimada de cosecha
   * @param diasParaCosecha Días restantes para cosecha
   * @returns Fecha estimada de cosecha
   */
  private calculateHarvestDate(diasParaCosecha: number): Date {
    const fechaCosecha = new Date();
    fechaCosecha.setDate(fechaCosecha.getDate() + diasParaCosecha);
    return fechaCosecha;
  }

  /**
   * Maneja errores de manera consistente
   * @param operation Nombre de la operación que falló
   * @returns Función para manejar errores
   */
  private handleError<T>(operation = 'operation') {
    return (error: any): Observable<T> => {
      console.error(`❌ Error en ${operation}:`, error);
      this.loadingSubject.next(false);
      
      // Retornar un valor por defecto apropiado según el tipo
      let fallbackValue: T;
      
      if (operation.includes('getCropById')) {
        fallbackValue = null as T;
      } else if (operation.includes('Statistics')) {
        fallbackValue = {
          crops: [],
          totalCrops: 0,
          activeCrops: 0,
          averageHealth: 'Desconocida'
        } as T;
      } else {
        // Para arrays de CropInfo[]
        fallbackValue = [] as T;
      }
      
      return throwError(() => new Error(`Error en ${operation}: ${error.message}`));
    };
  }

  /**
   * Métodos de utilidad para datos de ejemplo
   */
  async createSampleData(): Promise<void> {
    const sampleCrops: Omit<CropInfo, 'id'>[] = [
      {
        tipo: 'Tomate',
        crecimiento: 75,
        salud: 'Excelente',
        diasParaCosecha: 12,
        rendimientoEst: 2.3,
        fechaPlantado: new Date('2024-08-15'),
        ubicacion: { lat: -7.1614, lon: -78.5126, nombre: 'Parcela A' },
        notas: 'Buen desarrollo, sin plagas visibles'
      },
      {
        tipo: 'Lechuga',
        crecimiento: 45,
        salud: 'Buena',
        diasParaCosecha: 25,
        rendimientoEst: 1.8,
        fechaPlantado: new Date('2024-09-01'),
        ubicacion: { lat: -7.1614, lon: -78.5126, nombre: 'Invernadero 1' }
      },
      {
        tipo: 'Zanahoria',
        crecimiento: 90,
        salud: 'Excelente',
        diasParaCosecha: 5,
        rendimientoEst: 3.1,
        fechaPlantado: new Date('2024-07-20'),
        ubicacion: { lat: -7.1614, lon: -78.5126, nombre: 'Campo Sur' }
      }
    ];

    for (const crop of sampleCrops) {
      await this.createCrop(crop);
    }

    console.log('📊 Datos de ejemplo creados exitosamente');
  }
}