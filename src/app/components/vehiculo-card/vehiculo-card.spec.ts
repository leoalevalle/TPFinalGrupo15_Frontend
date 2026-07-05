import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculoCard } from './vehiculo-card';

describe('VehiculoCard', () => {
  let component: VehiculoCard;
  let fixture: ComponentFixture<VehiculoCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculoCard],
    }).compileComponents();

    fixture = TestBed.createComponent(VehiculoCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
