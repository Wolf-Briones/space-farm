import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-ganaderia',
  imports: [],
  templateUrl: './ganaderia.component.html',
  styleUrl: './ganaderia.component.scss'
})
export class GanaderiaComponent {
 @Output() actionClicked = new EventEmitter<string>();

  onActionClick(action: string): void {
    this.actionClicked.emit(action);
  }
}
