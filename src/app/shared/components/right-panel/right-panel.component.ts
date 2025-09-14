import { Component } from '@angular/core';
import { CurrentWeatherComponent } from './current-weather/current-weather.component';
import { CropInfoComponent } from './crop-info/crop-info.component';

@Component({
  selector: 'app-right-panel',
  imports: [CurrentWeatherComponent, CropInfoComponent],
  templateUrl: './right-panel.component.html',
  styleUrl: './right-panel.component.scss'
})
export class RightPanelComponent {

}
