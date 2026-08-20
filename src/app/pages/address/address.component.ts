/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {
  @ViewChild('myModal3') public myModal3: ModalDirective;
  dummy: any[] = [];
  list: any[] = [];
  totalAddress: any = 0;
  page: number = 1;
  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    this.getList();
  }

  getList() {
    this.dummy = Array(5);
    this.list = [];
    this.api.get_private('v1/address/getAll?page=' + (this.page - 1)).then((data: any) => {
      console.log(data);
      this.dummy = [];
      if (data && data.status && data.status == 200 && data.data && data.data.length) {
        this.list = data.data;
        this.totalAddress = data.totalAddress;
        console.log(Object.keys(this.list[0]));
      }
    }, error => {
      console.log(error);
      this.dummy = [];
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.dummy = [];
      this.util.apiErrorHandler(error);
    });
  }

  pageChange(event: any) {
    console.log(event);
    this.page = event;
    console.log('page->', this.page)
    this.getList();
  }

  ngOnInit(): void {
  }

  exportCSV() {
    let data: any = [];
    this.list.forEach(element => {
      const info = {
        'id': this.util.replaceWithDot(element.id),
        'user': this.util.replaceWithDot(element.first_name) + ' ' + this.util.replaceWithDot(element.last_name),
        'address': this.util.replaceWithDot(element.address),
        'title': this.util.replaceWithDot(element.title),
        'house': this.util.replaceWithDot(element.house),
        'landmark': this.util.replaceWithDot(element.landmark),
        'pincode': this.util.replaceWithDot(element.pincode),
      }
      data.push(info);
    });
    const name = 'address';
    this.util.downloadFile(data, name, ['id', 'user', 'address', 'title', 'house', 'landmark', 'pincode']);
  }

  importCSV() {
    this.myModal3.show();
  }

  deleteAddress(item: any) {
    console.log(item);
    Swal.fire({
      title: this.util.translate('Are you sure?'),
      text: this.util.translate('To delete this item?'),
      icon: 'question',
      showConfirmButton: true,
      confirmButtonText: this.util.translate('Yes'),
      showCancelButton: true,
      cancelButtonText: this.util.translate('Cancel'),
      backdrop: false,
      background: 'white'
    }).then((data) => {
      if (data && data.value) {
        console.log('update it');

        this.util.show();
        this.api.post_private('v1/address/destroy', { id: item.id }).then((data: any) => {
          console.log(data);
          this.util.hide();
          if (data && data.status && data.status == 200) {
            this.getList();
          }
        }).catch(error => {
          console.log(error);
          this.util.hide();
          this.util.apiErrorHandler(error);
        });
      }
    });
  }

  saveType() {
    this.myModal3.hide();
  }

  downloadSample() {
    window.open('assets/sample/address.csv', '_blank');
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
      this.api.uploaCSV(files, 'v1/address/importData').subscribe((data: any) => {
        console.log('==>>>>>>', data.data);
        this.util.hide();
        this.myModal3.hide();
        this.util.success('Uploaded');
        this.getList();
      }, err => {
        console.log(err);
        this.util.hide();
        this.util.apiErrorHandler(err);
      });
    } else {
      console.log('no');
    }
  }
}
