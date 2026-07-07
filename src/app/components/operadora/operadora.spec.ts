import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Operadora } from './operadora';

describe('Operadora', () => {
  let component: Operadora;
  let fixture: ComponentFixture<Operadora>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Operadora],
    }).compileComponents();

    fixture = TestBed.createComponent(Operadora);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
