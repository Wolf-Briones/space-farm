import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiegoAiRecommendationsComponent } from './riego-ai-recommendations.component';

describe('RiegoAiRecommendationsComponent', () => {
  let component: RiegoAiRecommendationsComponent;
  let fixture: ComponentFixture<RiegoAiRecommendationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiegoAiRecommendationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiegoAiRecommendationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
