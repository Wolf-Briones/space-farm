import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiegoPlantInfoComponent } from './riego-plant-info.component';

describe('RiegoPlantInfoComponent', () => {
  let component: RiegoPlantInfoComponent;
  let fixture: ComponentFixture<RiegoPlantInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiegoPlantInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiegoPlantInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
