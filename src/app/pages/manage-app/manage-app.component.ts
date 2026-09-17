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
  selector: 'app-manage-app',
  templateUrl: './manage-app.component.html',
  styleUrls: ['./manage-app.component.scss']
})
export class ManageAppComponent implements OnInit {
  appStatus: any = 1;
  appVersion = '2.2';
  appMessage: any = '';
  appId: any = '';
  haveData: boolean = false;
  deliveryOptions: any = {
    instant: { enabled: true, charge: 30 },
    today: { enabled: true, charge: 10 },
    tomorrow: { enabled: true, charge: 0 }
  };
  deliveryRows = [
    { key: 'instant', label: 'Instant delivery' },
    { key: 'today', label: 'Scheduled today' },
    { key: 'tomorrow', label: 'Scheduled tomorrow' }
  ];
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
    this.api.get_private('v1/manage/getAll').then((data: any) => {
      console.log(data);
      this.util.hide();
      if (data && data.status && data.status == 200 && data.data && data.data.length) {
        this.haveData = true;
        // Public app settings use the newest record as well.
        data.data.sort((a: any, b: any) => Number(b.id) - Number(a.id));
        this.appVersion = data.data[0].app_version || '2.2';
        this.appStatus = data.data[0].app_close;
        this.appMessage = data.data[0].message;
        this.appId = data.data[0].id;
        const saved = data.data[0].delivery_options;
        if (saved) this.deliveryRows.forEach(row => {
          if (saved[row.key]) this.deliveryOptions[row.key] = {
            enabled: !!Number(saved[row.key].enabled), charge: Number(saved[row.key].charge),
            for_instant: saved[row.key].for_instant == null ? true : !!Number(saved[row.key].for_instant)
          };
        });
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
    this.appVersion = this.appVersion.trim();
    if (this.appVersion.length > 32 || !/^\d+(?:\.\d+){1,3}(?:-[A-Za-z0-9.-]+)?$/.test(this.appVersion)) {
      this.util.error('Enter a valid app version, for example 2.2 or 2.2.1');
      return false;
    }
    if (this.deliveryRows.some(row => !Number.isFinite(Number(this.deliveryOptions[row.key].charge)) || Number(this.deliveryOptions[row.key].charge) < 0)) {
      this.util.error('Enter a valid delivery charge for every option');
      return false;
    }
    const deliveryOptions: Record<string, { enabled: number; charge: number; for_instant: number }> = {};
    this.deliveryRows.forEach(row => deliveryOptions[row.key] = {
      enabled: this.deliveryOptions[row.key].enabled ? 1 : 0,
      charge: Number(this.deliveryOptions[row.key].charge),
      for_instant: this.deliveryOptions[row.key].for_instant === false ? 0 : 1
    });
    if (this.appMessage == '' || this.appMessage == null) {
      this.util.error('Please enter message');
      return false;
    }
    if (this.haveData == true) {
      // edit
      const param = {
        id: this.appId,
        app_version: this.appVersion,
        delivery_options: deliveryOptions,
        app_close: this.appStatus,
        message: this.appMessage,
        date_time: moment().format('YYYY-MM-DD')
      }
      this.util.show();
      this.api.post_private('v1/manage/update', param).then((data: any) => {
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
        app_version: this.appVersion,
        delivery_options: deliveryOptions,
        app_close: this.appStatus,
        message: this.appMessage,
        date_time: moment().format('YYYY-MM-DD')
      }
      this.util.show();
      this.api.post_private('v1/manage/create', param).then((data: any) => {
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
