import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiegoWeatherInfoComponent } from './riego-weather-info.component';

describe('RiegoWeatherInfoComponent', () => {
  let component: RiegoWeatherInfoComponent;
  let fixture: ComponentFixture<RiegoWeatherInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiegoWeatherInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiegoWeatherInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
