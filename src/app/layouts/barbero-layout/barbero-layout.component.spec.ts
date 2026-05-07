import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarberoLayoutComponent } from './barbero-layout.component';

describe('BarberoLayoutComponent', () => {
  let component: BarberoLayoutComponent;
  let fixture: ComponentFixture<BarberoLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BarberoLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BarberoLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
