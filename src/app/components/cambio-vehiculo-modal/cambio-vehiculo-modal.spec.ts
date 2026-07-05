import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambioVehiculoModal } from './cambio-vehiculo-modal';

describe('CambioVehiculoModal', () => {
  let component: CambioVehiculoModal;
  let fixture: ComponentFixture<CambioVehiculoModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CambioVehiculoModal],
    }).compileComponents();

    fixture = TestBed.createComponent(CambioVehiculoModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
