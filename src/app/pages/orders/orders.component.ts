/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  @ViewChild('myModal3') public myModal3: ModalDirective;
  dummy: any[] = [];
  orders: any[] = [];
  totalOrders: any = 0;
  page: number = 1;
  inputString: any = '';
  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router
  ) {
    this.getOrders();
  }

  ngOnInit(): void {
  }

  getOrders() {
    this.dummy = Array(10);
    this.orders = [];
    this.api.get_private('v1/orders/getAll?page=' + (this.page - 1)).then((data: any) => {
      this.dummy = [];
      if (data && data.status && data.status == 200 && data.success) {
        console.log(">>>>>", data);
        if (data && data.data.length > 0) {
          this.orders = data.data;
          this.totalOrders = data.totalOrders;
          console.log("---", this.orders);
        }
      }
    }, error => {
      this.dummy = [];
      console.log('Error', error);
      this.util.apiErrorHandler(error);
    }).catch(error => {
      this.dummy = [];
      console.log('Err', error);
      this.util.apiErrorHandler(error);
    });
  }

  pageChange(event: any) {
    console.log(event);
    this.page = event;
    console.log('page->', this.page)
    this.getOrders();
  }

  getNames(storeInfo: any) {
    const names = storeInfo.map((x: any) => x.name);
    return names.join();
  }

  exportCSV() {

    let data: any = [];
    this.orders.forEach(element => {
      const info = {
        'id': this.util.replaceWithDot(element.id),
        'username': this.util.replaceWithDot(element.first_name) + ' ' + this.util.replaceWithDot(element.last_name),
        'store': this.util.replaceWithDot(this.getNames(element.storeInfo)),
        'date': this.util.replaceWithDot(element.date_time),
        'total': this.util.replaceWithDot(element.grand_total),
        'order_to': this.util.replaceWithDot(element.order_to),
        'store_id': this.util.replaceWithDot(element.store_id),
      }
      data.push(info);
    });
    const name = 'orders';
    this.util.downloadFile(data, name, ['id', 'username', 'store', 'date', 'total', 'order_to', 'store_id']);
  }

  saveType() {
    this.myModal3.hide();
  }

  uploadCSV(files: any) {
    console.log('fle', files);
    if (files.length == 0) {
      return;
    }
    const mimeType = files[0].type;
    if (mimeType.match(/text\/*/) == null) {
      return;
    }

    if (files) {
      console.log('ok');
      this.util.show();
      this.api.uploaCSV(files, 'v1/orders/importData').subscribe((data: any) => {
        console.log('==>>>>>>', data.data);
        this.util.hide();
        this.myModal3.hide();
        this.util.success('Uploaded');
        this.getOrders();
      }, err => {
        console.log(err);
        this.util.hide();
        this.util.apiErrorHandler(err);
      });
    } else {
      console.log('no');
    }
  }

  importCSV() {
    this.myModal3.show();
  }

  downloadSample() {
    window.open('assets/sample/orders.csv', '_blank');
  }

  search() {
    if (this.inputString != '') {
      console.log('search data', this.inputString);
      this.totalOrders = 0;
      this.page = 0;
      this.dummy = Array(10);
      this.orders = [];
      this.api.post_private('v1/orders/searchAdminWithId', { id: this.inputString }).then((data: any) => {
        this.dummy = [];
        if (data && data.status && data.status == 200 && data.success) {
          console.log(">>>>>", data);
          if (data && data.data.length > 0) {
            this.orders = data.data;
            console.log("---", this.orders);
          }
        }
      }, error => {
        this.dummy = [];
        console.log('Error', error);
        this.util.apiErrorHandler(error);
      }).catch(error => {
        this.dummy = [];
        console.log('Err', error);
        this.util.apiErrorHandler(error);
      });
    }
  }

  viewsInfo(item: any) {
    const param: NavigationExtras = {
      queryParams: {
        id: item
      }
    }
    this.router.navigate(['order-details'], param);
  }

  clean() {
    this.inputString = '';
    this.page = 1;
    this.getOrders();
  }
}
