import { Component } from '@angular/core';

@Component({
  selector: 'app-riego',
  imports: [],
  templateUrl: './riego.component.html',
  styleUrl: './riego.component.scss'
})
export class RiegoComponent {
  onActionClick(action: string) {
    console.log(`Acción seleccionada: ${action}`);
  }

}
