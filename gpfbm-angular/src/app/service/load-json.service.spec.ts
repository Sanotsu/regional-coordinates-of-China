/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { LoadJsonService } from './load-json.service';

describe('Service: LoadJson', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadJsonService]
    });
  });

  it('should ...', inject([LoadJsonService], (service: LoadJsonService) => {
    expect(service).toBeTruthy();
  }));
});
