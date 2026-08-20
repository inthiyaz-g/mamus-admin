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
  selector: 'app-app-updates',
  templateUrl: './app-updates.component.html',
  styleUrls: ['./app-updates.component.scss']
})
export class AppUpdatesComponent implements OnInit {
  app_updates: any[] = [
    {
      app_url_playstore: '',
      app_url_app_store: '',
      app_version_android: '',
      app_version_ios: '',
      force_update: 0,
      app_name: 'User App'
    },
    {
      app_url_playstore: '',
      app_url_app_store: '',
      app_version_android: '',
      app_version_ios: '',
      force_update: 0,
      app_name: 'Store App'
    },
    {
      app_url_playstore: '',
      app_url_app_store: '',
      app_version_android: '',
      app_version_ios: '',
      force_update: 0,
      app_name: 'Driver App'
    },
  ];
  haveData: boolean = false;
  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    console.log(this.app_updates);
    this.getContent();
  }

  ngOnInit(): void {
  }

  getContent() {
    this.util.show();
    this.api.post_private('v1/flush/getByKey', { key: 'app_updates' }).then((data: any) => {
      this.util.hide();
      console.log(data);
      if (data && data.status && data.status == 200 && data.data) {
        const info = data.data;
        console.log(info);
        this.haveData = true;
        this.app_updates = JSON.parse(info.value);
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
    console.log(this.app_updates);
    const app_url_app_store = this.app_updates.map(x => x.app_url_app_store);
    if (app_url_app_store.includes("")) {
      this.util.error(this.util.translate('All fields are required'));
      return false;
    }

    const app_url_playstore = this.app_updates.map(x => x.app_url_playstore);
    if (app_url_playstore.includes("")) {
      this.util.error(this.util.translate('All fields are required'));
      return false;
    }

    const app_version_android = this.app_updates.map(x => x.app_version_android);
    if (app_version_android.includes("")) {
      this.util.error(this.util.translate('All fields are required'));
      return false;
    }

    const app_version_ios = this.app_updates.map(x => x.app_version_ios);
    if (app_version_ios.includes("")) {
      this.util.error(this.util.translate('All fields are required'));
      return false;
    }

    console.log('ok', this.haveData);

    if (this.haveData == true) {
      console.log('update');
      this.updateInfo();
    } else {
      console.log('create');
      this.createInfo();
    }
  }

  updateInfo() {
    const param = {
      key: 'app_updates',
      value: JSON.stringify(this.app_updates),
      status: 1
    };
    this.util.show();
    this.api.post_private('v1/flush/update', param).then((data: any) => {
      console.log(data);
      this.util.hide();
      this.getContent();
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

  createInfo() {
    const param = {
      key: 'app_updates',
      value: JSON.stringify(this.app_updates),
      status: 1
    };
    this.util.show();
    this.api.post_private('v1/flush/save', param).then((data: any) => {
      console.log(data);
      this.util.hide();
      this.getContent();
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
