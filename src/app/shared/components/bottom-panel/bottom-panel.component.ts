import { Component, ViewEncapsulation } from '@angular/core';
import { CultivosComponent } from './cultivos/cultivos.component';
import { InvestigacionComponent } from './investigacion/investigacion.component';
import { GanaderiaComponent } from './ganaderia/ganaderia.component';
import { RiegoComponent } from './riego/riego.component'; 

@Component({
  selector: 'app-bottom-panel',
  imports: [ CultivosComponent, InvestigacionComponent, GanaderiaComponent, RiegoComponent ],
  templateUrl: './bottom-panel.component.html',
  styleUrl: './bottom-panel.component.scss',
  encapsulation: ViewEncapsulation.None 
})
export class BottomPanelComponent {

  onActionClick(action: string) {
    console.log(`Acción seleccionada: ${action}`);
  }
}
