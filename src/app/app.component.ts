import { Component, ViewEncapsulation } from '@angular/core';
/* import { RouterOutlet } from '@angular/router'; */
import { GameComponent } from './views/game/game.component'; 
import { EarthNasaComponent } from './views/earth-nasa/earth-nasa.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [ CommonModule, EarthNasaComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None 
})
export class AppComponent {
  title = 'spacefarmapp';
  dev: boolean = true;
}
