/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { IconSetService } from '@coreui/icons-angular';
import { brandSet, flagSet, freeSet } from '@coreui/icons';
import { Title } from '@angular/platform-browser';
import { ApiService } from './services/api.service';
import { UtilService } from './services/util.service';
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'body',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  title = 'Ultimate Grocery Admin Panel';

  constructor(
    private router: Router,
    private titleService: Title,
    private iconSetService: IconSetService,
    private api: ApiService,
    public util: UtilService,
  ) {
    titleService.setTitle(this.title);

    // iconSet singleton
    iconSetService.icons = { ...brandSet, ...flagSet, ...freeSet };

    const language = localStorage.getItem('translateKey');
    if (language && language != null && language != 'null') {
      this.api.post('v1/settings/getByLanguageIdWeb', { id: language }).then((data: any) => {
        console.log('by language', data);
        if (data && data.status && data.status == 200) {
          this.saveSettings(data);

        }
      }, error => {
        console.log(error);
        this.util.apiErrorHandler(error);
      }).catch(error => {
        console.log(error);
        this.util.apiErrorHandler(error);
      });
    } else {
      this.api.get_public('v1/settings/getDefaultWeb').then((data: any) => {
        console.log('by default', data);
        if (data && data.status && data.status == 200) {
          this.saveSettings(data);

        }
      }, error => {
        console.log(error);
        this.util.apiErrorHandler(error);
      }).catch(error => {
        console.log(error);
        this.util.apiErrorHandler(error);
      });
    }
  }

  ngOnInit(): void {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });
  }

  saveSettings(data: any) {
    const lang = data && data.data && data.data.language ? data.data.language : null;
    if (lang && lang != null) {
      this.util.translations = JSON.parse(lang.content);
      localStorage.setItem('translateKey', lang.id);
    }
    const settings = data && data.data && data.data.settings ? data.data.settings : null;
    if (settings) {
      this.util.appLogo = settings.logo;
      this.util.direction = settings.appDirection;
      this.util.app_status = settings.app_status == 1 ? true : false;
      this.util.app_color = settings.app_color;
      this.util.currecny = settings.currencySymbol;
      this.util.cside = settings.currencySide;
      localStorage.setItem('theme', 'primary');
      document.documentElement.dir = this.util.direction;
    }

    const general = data && data.data && data.data.general ? data.data.general : null;
    if (general) {
      this.util.appName = general.name;
      this.util.general = general;
    }

    this.util.allLanguages = data.data.allLanguages;

    console.log(this.util);
    // this.util.navigateRoot('');
  }
}
