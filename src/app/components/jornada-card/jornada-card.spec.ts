import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JornadaCard } from './jornada-card';

describe('JornadaCard', () => {
  let component: JornadaCard;
  let fixture: ComponentFixture<JornadaCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JornadaCard],
    }).compileComponents();

    fixture = TestBed.createComponent(JornadaCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
