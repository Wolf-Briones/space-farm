import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiegoStatsPanelComponent } from './riego-stats-panel.component';

describe('RiegoStatsPanelComponent', () => {
  let component: RiegoStatsPanelComponent;
  let fixture: ComponentFixture<RiegoStatsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiegoStatsPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiegoStatsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
