import { Component } from '@angular/core';

@Component({
  selector: 'app-investigacion',
  imports: [],
  templateUrl: './investigacion.component.html',
  styleUrl: './investigacion.component.scss'
})
export class InvestigacionComponent {
  onActionClick(action: string) {
    console.log(`Acción seleccionada: ${action}`);
  }
}
