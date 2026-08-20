import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PrintRequestsRoutingModule } from './print-requests-routing.module';
import { PrintRequestsComponent } from './print-requests.component';

@NgModule({
  declarations: [PrintRequestsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    NgxSkeletonLoaderModule.forRoot({ animation: 'progress-dark' }),
    NgxSpinnerModule,
    PrintRequestsRoutingModule,
  ],
})
export class PrintRequestsModule { }
