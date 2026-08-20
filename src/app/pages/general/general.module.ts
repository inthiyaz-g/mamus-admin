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

import { GeneralRoutingModule } from './general-routing.module';
import { GeneralComponent } from './general.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    GeneralComponent
  ],
  imports: [
    CommonModule,
    GeneralRoutingModule,
    NgxSpinnerModule,
    ModalModule.forRoot(),
    FormsModule,
    NgxSkeletonLoaderModule.forRoot({ animation: 'progress-dark' }),
  ]
})
export class GeneralModule { }
