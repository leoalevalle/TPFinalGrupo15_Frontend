import { TestBed } from '@angular/core/testing';

import { GoogleRegister } from './google-register';

describe('GoogleRegister', () => {
  let service: GoogleRegister;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleRegister);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
