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

import { ManageLanguagesRoutingModule } from './manage-languages-routing.module';
import { ManageLanguagesComponent } from './manage-languages.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [
    ManageLanguagesComponent
  ],
  imports: [
    CommonModule,
    ManageLanguagesRoutingModule,
    ModalModule.forRoot(),
    FormsModule,
    NgxSpinnerModule
  ]
})
export class ManageLanguagesModule { }
