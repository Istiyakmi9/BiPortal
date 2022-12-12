import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferletterComponent } from './offerletter.component';

describe('OfferletterComponent', () => {
  let component: OfferletterComponent;
  let fixture: ComponentFixture<OfferletterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfferletterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfferletterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
