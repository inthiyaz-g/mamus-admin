/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppUpdatesComponent } from './app-updates.component';

describe('AppUpdatesComponent', () => {
  let component: AppUpdatesComponent;
  let fixture: ComponentFixture<AppUpdatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppUpdatesComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AppUpdatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
