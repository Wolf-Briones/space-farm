import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-investigacion',
  imports: [],
  templateUrl: './investigacion.component.html',
  styleUrl: './investigacion.component.scss'
})
export class InvestigacionComponent {
  @Output() actionClicked = new EventEmitter<string>();

  onActionClick(action: string): void {
    this.actionClicked.emit(action);
  }
}

