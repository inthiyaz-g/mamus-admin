/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-manage-popup',
  templateUrl: './manage-popup.component.html',
  styleUrls: ['./manage-popup.component.scss']
})
export class ManagePopupComponent implements OnInit {
  appStatus: any = 1;
  appMessage: any = '';
  appId: any = '';
  haveData: boolean = false;
  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    this.getCurrent();
  }

  ngOnInit(): void {
  }

  getCurrent() {
    this.util.show();
    this.api.get_private('v1/popup/getAll').then((data: any) => {
      console.log(data);
      this.util.hide();
      if (data && data.status && data.status == 200 && data.data && data.data.length) {
        this.haveData = true;
        this.appStatus = data.data[0].shown;
        this.appMessage = data.data[0].message;
        this.appId = data.data[0].id;
        console.log(this.appId);
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
  save() {
    if (this.appMessage == '' || this.appMessage == null) {
      this.util.error('Please enter message');
      return false;
    }
    if (this.haveData == true) {
      // edit
      const param = {
        id: this.appId,
        shown: this.appStatus,
        message: this.appMessage,
        date_time: moment().format('YYYY-MM-DD')
      }
      this.util.show();
      this.api.post_private('v1/popup/update', param).then((data: any) => {
        this.util.hide();
        this.util.success('Saved');
        this.getCurrent();
      }, error => {
        console.log(error);
        this.util.hide();
        this.util.apiErrorHandler(error);
      }).catch(error => {
        console.log(error);
        this.util.hide();
        this.util.apiErrorHandler(error);
      });
    } else {
      // new
      const param = {
        shown: this.appStatus,
        message: this.appMessage,
        date_time: moment().format('YYYY-MM-DD')
      }
      this.util.show();
      this.api.post_private('v1/popup/create', param).then((data: any) => {
        this.util.hide();
        this.util.success('Saved');
        this.getCurrent();
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
}
