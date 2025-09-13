import { Component,Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-riegos',
  imports: [],
  templateUrl: './riegos.component.html',
  styleUrl: './riegos.component.scss'
})
export class RiegosComponent {
   @Output() actionClicked = new EventEmitter<string>();

  onActionClick(action: string): void {
    this.actionClicked.emit(action);
  }

}
