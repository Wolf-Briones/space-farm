import { Component } from '@angular/core';
import { TemperaturaService } from '../../../../core/services/temperatura.service'; 

@Component({
  selector: 'app-cultivos',
  imports: [],
  templateUrl: './cultivos.component.html',
  styleUrl: './cultivos.component.scss'
})
export class CultivosComponent {
  onActionClick(action: string) {
    console.log(`Acción seleccionada: ${action}`);
  }

}
