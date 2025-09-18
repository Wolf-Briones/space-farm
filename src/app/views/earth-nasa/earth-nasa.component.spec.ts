import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EarthNasaComponent } from './earth-nasa.component';

describe('EarthNasaComponent', () => {
  let component: EarthNasaComponent;
  let fixture: ComponentFixture<EarthNasaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EarthNasaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EarthNasaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
