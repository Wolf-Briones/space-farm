import { Component } from '@angular/core';
import { LayoutRiegoComponent } from './layout-riego/layout-riego.component';
import { NgFor, NgIf } from '@angular/common';
import { FarmPlot } from '../../interfaces/interfaces.test';

@Component({
  selector: 'app-layout',
  imports: [LayoutRiegoComponent, NgIf],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  notification: string = 'Riego automático activado en Sector B';
  showNotification: boolean = true;
    farmPlots: FarmPlot[] = [];

}
