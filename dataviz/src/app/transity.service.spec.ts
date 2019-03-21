import { TestBed } from '@angular/core/testing';

import { TransityService } from './transity.service';

describe('TransityService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TransityService = TestBed.get(TransityService);
    expect(service).toBeTruthy();
  });
});
