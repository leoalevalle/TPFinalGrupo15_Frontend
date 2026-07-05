import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleLogin } from './google-login';

describe('GoogleLogin', () => {
  let component: GoogleLogin;
  let fixture: ComponentFixture<GoogleLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleLogin],
    }).compileComponents();

    fixture = TestBed.createComponent(GoogleLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
