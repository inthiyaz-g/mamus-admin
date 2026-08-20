/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss']
})
export class OffersComponent implements OnInit {
  @ViewChild('myModal3') public myModal3: ModalDirective;
  @ViewChild('myModal2') public myModal2: ModalDirective;
  dummy: any[] = [];
  list: any[] = [];
  dummyList: any[] = [];
  page: number = 1;


  name: any = '';
  off: any = '';
  type: any = '';
  min: any = '';
  date_time: any = '';
  descriptions: any = '';
  cover: any = '';
  upto: any = '';
  status: any = 1;

  action: any = '';
  from: any = '';
  to: any = '';

  offerId: any = '';
  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    this.getList();
  }
  getList() {
    this.dummy = Array(5);
    this.list = [];
    this.dummyList = [];
    this.api.get_private('v1/offers/getAll').then((data: any) => {
      console.log(data);
      this.dummy = [];
      if (data && data.status && data.status == 200 && data.data && data.data.length) {
        this.list = data.data;
        this.dummyList = data.data;
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

  getDate(item: any) {
    return moment(item).format('lll');
  }

  ngOnInit(): void {
  }


  changeStatus(item: any) {
    console.log(item);
    Swal.fire({
      title: this.util.translate('Are you sure?'),
      text: this.util.translate('To update this item?'),
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
        const body = {
          id: item.id,
          status: item.status == 0 ? 1 : 0
        };
        console.log("========", body);
        this.util.show();
        this.api.post_private('v1/offers/updateStatus', body).then((data: any) => {
          this.util.hide();
          console.log("+++++++++++++++", data);
          if (data && data.status && data.status == 200 && data.success) {
            this.util.success(this.util.translate('Status Updated !'));
            this.getList();
          }
        }, error => {
          this.util.hide();
          console.log('Error', error);
          this.util.apiErrorHandler(error);
        }).catch(error => {
          this.util.hide();
          console.log('Err', error);
          this.util.apiErrorHandler(error);
        });
      }
    });
    //offers/updateStatus
  }


  preview_banner(files: any) {
    console.log('fle', files);
    if (files.length == 0) {
      return;
    }
    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    if (files) {
      console.log('ok');
      this.util.show();
      this.api.uploadFile(files).subscribe((data: any) => {
        console.log('==>>>>>>', data.data);
        this.util.hide();
        if (data && data.data.image_name) {
          this.cover = data.data.image_name;
        }
      }, err => {
        console.log(err);
        this.util.hide();
      });
    } else {
      console.log('no');
    }
  }


  addNew() {
    this.action = 'create';
    this.myModal2.show();
  }

  exportCSV() {
    let data: any = [];
    this.list.forEach(element => {
      const info = {
        'id': this.util.replaceWithDot(element.id),
        'image': this.util.replaceWithDot(element.image),
        'name': this.util.replaceWithDot(element.name),
        'off': this.util.replaceWithDot(element.off),
        'date_time': this.util.replaceWithDot(element.date_time),
        'descriptions': this.util.replaceWithDot(element.descriptions),
        'min': this.util.replaceWithDot(element.min),
        'upto': this.util.replaceWithDot(element.upto),
        'manage': this.util.replaceWithDot(element.manage),
      }
      data.push(info);
    });
    const name = 'offers';
    this.util.downloadFile(data, name, ['id', 'image', 'name', 'off', 'date_time', 'descriptions', 'min', 'upto', 'manage']);
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
      this.api.uploaCSV(files, 'v1/offers/importData').subscribe((data: any) => {
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

  importCSV() {
    this.myModal3.show();
  }

  clearData() {
    this.name = '';
    this.off = '';
    this.min = '';
    this.upto = '';
    this.type = '';
    this.cover = '';
    this.descriptions = '';
    this.from = '';
    this.to = '';
    this.action = 'create';
  }
  downloadSample() {
    window.open('assets/sample/offers.csv', '_blank');
  }

  saveChanges() {
    if (this.name == '' || this.name == null || this.off == '' || this.off == null || this.min == '' || this.min == null || this.upto == '' || this.upto == null ||
      this.type == '' || this.type == null || this.cover == '' || this.cover == null || this.descriptions == null || this.descriptions == '' || this.from == '' || this.from == null ||
      this.to == '' || this.to == null) {
      this.util.error(this.util.translate('All Fields are required'));
      return false;
    }

    const param = {
      name: this.name,
      off: this.off,
      type: this.type,
      min: this.min,
      from: this.from,
      to: this.to,
      manage: 0,
      date_time: this.to,
      descriptions: this.descriptions,
      status: 1,
      image: this.cover,
      upto: this.upto
    };

    this.util.show();
    this.api.post_private('v1/offers/create', param).then((data: any) => {
      console.log("+++++++++++++++", data);
      this.util.hide();
      if (data && data.status && data.status == 200 && data.success) {
        this.clearData();
        this.myModal2.hide();
        this.util.success(this.util.translate('Added !'));
        this.getList();
      }
    }, error => {
      this.util.hide();
      console.log('Error', error);
      this.util.apiErrorHandler(error);
    }).catch(error => {
      this.util.hide();
      console.log('Err', error);
      this.util.apiErrorHandler(error);
    });

  }

  updateChanges() {
    if (this.name == '' || this.name == null || this.off == '' || this.off == null || this.min == '' || this.min == null || this.upto == '' || this.upto == null ||
      this.type == '' || this.type == null || this.cover == '' || this.cover == null || this.descriptions == null || this.descriptions == '' || this.from == '' || this.from == null ||
      this.to == '' || this.to == null) {
      this.util.error(this.util.translate('All Fields are required'));
      return false;
    }

    const param = {
      name: this.name,
      off: this.off,
      type: this.type,
      min: this.min,
      from: this.from,
      to: this.to,
      manage: 0,
      date_time: this.to,
      descriptions: this.descriptions,
      status: 1,
      image: this.cover,
      upto: this.upto,
      id: this.offerId
    };

    this.util.show();
    this.api.post_private('v1/offers/update', param).then((data: any) => {
      console.log("+++++++++++++++", data);
      this.util.hide();
      if (data && data.status && data.status == 200 && data.success) {
        this.clearData();
        this.myModal2.hide();
        this.util.success(this.util.translate('Updated !'));
        this.getList();
      }
    }, error => {
      this.util.hide();
      console.log('Error', error);
      this.util.apiErrorHandler(error);
    }).catch(error => {
      this.util.hide();
      console.log('Err', error);
      this.util.apiErrorHandler(error);
    });
  }


  openOffers(item: any) {
    this.offerId = item.id;
    this.util.show();
    this.api.post_private('v1/offers/getById', item).then((data: any) => {
      this.util.hide();
      console.log("+++++++++++++++", data);
      if (data && data.status && data.status == 200 && data.success) {
        this.action = 'edit';
        const info = data.data;
        this.name = info.name;
        this.off = info.off;
        this.min = info.min;
        this.upto = info.upto;
        this.type = info.type;
        this.cover = info.image;
        this.descriptions = info.descriptions;
        this.from = info.from;
        this.to = info.to;
        this.myModal2.show();
      }
    }, error => {
      this.util.hide();
      console.log('Error', error);
      this.util.apiErrorHandler(error);
    }).catch(error => {
      this.util.hide();
      console.log('Err', error);
      this.util.apiErrorHandler(error);
    });
  }
}
