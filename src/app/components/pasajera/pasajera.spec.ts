import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pasajera } from './pasajera';

describe('Pasajera', () => {
  let component: Pasajera;
  let fixture: ComponentFixture<Pasajera>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pasajera],
    }).compileComponents();

    fixture = TestBed.createComponent(Pasajera);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
