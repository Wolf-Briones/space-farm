import { Component } from '@angular/core';
import { CurrentWeatherComponent } from './current-weather/current-weather.component';
import { CropInfoComponent } from './crop-info/crop-info.component';
import { RiegoPlantInfoComponent } from './riego-plant-info/riego-plant-info.component';

@Component({
  selector: 'app-right-panel',
  imports: [CurrentWeatherComponent, CropInfoComponent, RiegoPlantInfoComponent],
  templateUrl: './right-panel.component.html',
  styleUrl: './right-panel.component.scss'
})
export class RightPanelComponent {

}
