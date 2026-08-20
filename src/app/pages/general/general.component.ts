/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss']
})
export class GeneralComponent implements OnInit {
  name: any = '';
  mobile: any = '';
  email: any = '';
  address: any = '';
  city: any = '';
  state: any = '';
  zip: any = '';
  country: any = '';
  min: any = '';
  free: any = '';
  tax: any = 0;
  shipping: any = 'km';
  shippingPrice: any = '';

  haveData: boolean = false;
  id: any = '';
  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    this.getContent();
  }

  ngOnInit(): void {
  }

  getContent() {
    this.util.show();
    this.api.get_private('v1/general/getAll').then((data: any) => {
      console.log(data);
      this.util.hide();
      if (data && data.status && data.status == 200 && data.data) {
        const info = data.data;
        this.id = info.id;
        this.name = info.name;
        this.mobile = info.mobile;
        this.email = info.email;
        this.address = info.address;
        this.city = info.city;
        this.state = info.state;
        this.zip = info.zip;
        this.country = info.country;
        this.min = info.min;
        this.free = info.free;
        this.tax = info.tax;
        this.shipping = info.shipping;
        this.shippingPrice = info.shippingPrice;
        this.haveData = true;
      }
    }, error => {
      console.log(error);
      this.util.hide();
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.util.hide();
      this.util.apiErrorHandler(error);
    });
  }
  saveChanges() {
    if (this.name == '' || this.name == null || this.mobile == '' || this.mobile == null || this.email == '' || this.email == null || this.address == '' || this.address == null ||
      this.city == '' || this.city == null || this.state == '' || this.state == null || this.zip == '' || this.zip == null || this.country == '' || this.country == null ||
      this.min == '' || this.min == null || this.free == '' || this.free == null || this.shippingPrice == '' || this.shippingPrice == null) {
      this.util.error(this.util.translate('All fields are required'));
      return false;
    }
    if (this.haveData == true) {
      this.updateGeneral();
    } else {
      this.createGeneral();
    }
  }

  createGeneral() {
    console.log('create');
    const param = {
      name: this.name,
      mobile: this.mobile,
      email: this.email,
      address: this.address,
      city: this.city,
      state: this.state,
      zip: this.zip,
      country: this.country,
      min: this.min,
      free: this.free,
      tax: this.tax,
      shipping: this.shipping,
      shippingPrice: this.shippingPrice,
      status: 1
    };

    this.util.show();
    this.api.post_private('v1/general/save', param).then((data: any) => {
      console.log(data);
      this.util.hide();
      if (data && data.status == 200) {
        this.getContent();
        window.location.reload();
      }
    }, error => {
      console.log(error);
      this.util.hide();
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.util.hide();
      this.util.apiErrorHandler(error);
    });
  }

  updateGeneral() {
    console.log('update');
    const param = {
      name: this.name,
      mobile: this.mobile,
      email: this.email,
      address: this.address,
      city: this.city,
      state: this.state,
      zip: this.zip,
      country: this.country,
      min: this.min,
      free: this.free,
      tax: this.tax,
      shipping: this.shipping,
      shippingPrice: this.shippingPrice,
      status: 1,
      id: this.id
    };

    this.util.show();
    this.api.post_private('v1/general/update', param).then((data: any) => {
      console.log(data);
      this.util.hide();
      if (data && data.status == 200) {
        this.getContent();
        window.location.reload();
      }
    }, error => {
      console.log(error);
      this.util.hide();
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.util.hide();
      this.util.apiErrorHandler(error);
    });
  }
}
