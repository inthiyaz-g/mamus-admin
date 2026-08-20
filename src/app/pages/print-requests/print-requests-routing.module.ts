import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrintRequestsComponent } from './print-requests.component';

const routes: Routes = [
  {
    path: '',
    component: PrintRequestsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrintRequestsRoutingModule { }
