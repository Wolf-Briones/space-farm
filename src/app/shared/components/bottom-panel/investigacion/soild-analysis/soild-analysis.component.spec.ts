import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoildAnalysisComponent } from './soild-analysis.component';

describe('SoildAnalysisComponent', () => {
  let component: SoildAnalysisComponent;
  let fixture: ComponentFixture<SoildAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoildAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoildAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
