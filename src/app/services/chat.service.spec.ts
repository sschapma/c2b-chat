/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ChatServiceService } from './chat-service.service';

describe('Service: ChatService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatServiceService]
    });
  });

  it('should ...', inject([ChatServiceService], (service: ChatServiceService) => {
    expect(service).toBeTruthy();
  }));
});
