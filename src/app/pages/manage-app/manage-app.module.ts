/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageAppRoutingModule } from './manage-app-routing.module';
import { ManageAppComponent } from './manage-app.component';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [
    ManageAppComponent
  ],
  imports: [
    CommonModule,
    ManageAppRoutingModule,
    FormsModule,
    NgxSpinnerModule,
  ]
})
export class ManageAppModule { }
