import { TestBed } from '@angular/core/testing';

import { ConductoraService } from './conductora';

describe('ConductoraService', () => {
  let service: ConductoraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConductoraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
