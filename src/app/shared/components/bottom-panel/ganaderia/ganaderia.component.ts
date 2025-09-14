import { Component } from '@angular/core';

@Component({
  selector: 'app-ganaderia',
  imports: [],
  templateUrl: './ganaderia.component.html',
  styleUrl: './ganaderia.component.scss'
})
export class GanaderiaComponent {
  onActionClick(action: string) {
    console.log(`Acción seleccionada: ${action}`);
  }
}
