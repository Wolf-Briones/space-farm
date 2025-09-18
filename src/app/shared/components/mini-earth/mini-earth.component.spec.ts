import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniEarthComponent } from './mini-earth.component';

describe('MiniEarthComponent', () => {
  let component: MiniEarthComponent;
  let fixture: ComponentFixture<MiniEarthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniEarthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiniEarthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
