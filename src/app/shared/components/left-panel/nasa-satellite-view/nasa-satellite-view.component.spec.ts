// src/app/shared/components/left-panel/nasa-satellite-view/nasa-satellite-view.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NasaSatelliteViewComponent } from './nasa-satellite-view.component';

describe('NasaSatelliteViewComponent', () => {
  let component: NasaSatelliteViewComponent;
  let fixture: ComponentFixture<NasaSatelliteViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NasaSatelliteViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NasaSatelliteViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});