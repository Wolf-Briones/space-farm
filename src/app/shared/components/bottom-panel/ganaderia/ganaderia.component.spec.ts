import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GanaderiaComponent } from './ganaderia.component';

describe('GanaderiaComponent', () => {
  let component: GanaderiaComponent;
  let fixture: ComponentFixture<GanaderiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GanaderiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GanaderiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
