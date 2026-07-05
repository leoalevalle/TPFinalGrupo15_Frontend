import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Conductora } from './conductora';

describe('Conductora', () => {
  let component: Conductora;
  let fixture: ComponentFixture<Conductora>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Conductora],
    }).compileComponents();

    fixture = TestBed.createComponent(Conductora);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
