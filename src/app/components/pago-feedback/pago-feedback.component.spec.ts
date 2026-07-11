import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoFeedbackComponent } from './pago-feedback';

describe('PagoFeedbackComponent', () => {
  let component: PagoFeedbackComponent;
  let fixture: ComponentFixture<PagoFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoFeedbackComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PagoFeedbackComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
