import { Component } from '@angular/core';
/* import { RouterOutlet } from '@angular/router'; */
import { GameComponent } from './views/game/game.component'; 

@Component({
  selector: 'app-root',
  imports: [/* RouterOutlet, */ GameComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'spacefarmapp';
}
