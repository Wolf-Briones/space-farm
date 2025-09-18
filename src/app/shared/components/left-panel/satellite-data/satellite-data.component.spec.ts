// src/app/shared/components/left-panel/satellite-data/satellite-data.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SatelliteDataComponent } from './satellite-data.component';

describe('SatelliteDataComponent', () => {
  let component: SatelliteDataComponent;
  let fixture: ComponentFixture<SatelliteDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SatelliteDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SatelliteDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});