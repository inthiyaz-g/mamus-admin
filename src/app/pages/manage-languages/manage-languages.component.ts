/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-manage-languages',
  templateUrl: './manage-languages.component.html',
  styleUrls: ['./manage-languages.component.scss']
})
export class ManageLanguagesComponent implements OnInit {
  name: any = '';
  status: any = 'active';

  coverImage: any = '';
  fileURL: any = '';
  edit: boolean;
  id: any;
  position: any = 1;
  languagesJSON: any[] = [];
  page: any = 1;
  savedFiles: any[] = [];

  constructor(
    public api: ApiService,
    private route: ActivatedRoute,
    public util: UtilService,
    public chMod: ChangeDetectorRef,
    private location: Location) {
    this.api.getLanguageJson().then(data => {
      if (data) {
        let output = Object.entries(data).map(([key, value]) => ({ key, value }));
        this.languagesJSON = output;
      }
      console.log("====", this.languagesJSON);
    }).catch(error => {
      console.log(error);
    });
    this.route.queryParams.subscribe((data: any) => {
      console.log(data);
      if (data && data.id) {
        this.id = data.id;
        this.edit = true;
        this.getById();
      } else {
        this.edit = false;
      }
    });
  }

  getById() {
    const param = {
      id: this.id
    };
    this.util.show();
    this.api.post_private('v1/languages/getById', param).then((datas: any) => {
      this.util.hide();
      console.log('response', datas);
      if (datas && datas.data) {
        const info = datas.data;
        this.fileURL = info.cover;
        this.name = info.name;
        this.id = info.id;
        this.coverImage = this.api.imageUrl + info.cover;
        this.position = info.positions;
        if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(info.content)) {
          const files = JSON.parse(info.content);
          const output = Object.entries(files).map(([key, value]) => ({ key, value }));

          for (let i = 0; i < this.languagesJSON.length; i++) {
            for (let j = 0; j < output.length; j++) {
              if (this.languagesJSON[i].key && output[j].key && this.languagesJSON[i].key == output[j].key) {
                this.languagesJSON[i].value = output[j].value;
              }
            }
          }
        }
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

  ngOnInit(): void {
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
        console.log('==>>', data);
        this.util.hide();
        if (data && data.data.image_name) {
          this.fileURL = data.data.image_name;
          this.coverImage = this.api.imageUrl + data.data.image_name;
        }
      }, err => {
        console.log(err);
        this.util.hide();
      });
    } else {
      console.log('no');
    }
  }

  create() {
    const obj = this.languagesJSON.reduce(function (total, current) {
      total[current.key] = current.value;
      return total;
    }, {});
    console.log(obj);
    if (!this.name || this.name == '') {
      return false;
    }
    if (this.coverImage == '' || !this.coverImage) {
      return false;
    }

    const param = {
      cover: this.fileURL,
      status: 1,
      name: this.name,
      positions: this.position,
      content: JSON.stringify(obj)
    };
    console.log('ok', param);
    this.util.show();
    this.api.post_private('v1/languages/create', param).then(data => {
      this.util.hide();
      console.log(data);
      this.util.success(this.util.translate('Language added !'));
      this.location.back();
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

  update() {
    const obj = this.languagesJSON.reduce(function (total, current) {
      total[current.key] = current.value;
      return total;
    }, {});
    console.log(obj);
    if (!this.name || this.name == '') {
      return false;
    }
    if (this.coverImage == '' || !this.coverImage) {
      return false;
    }

    const param = {
      cover: this.fileURL,
      name: this.name,
      id: this.id,
      positions: this.position,
      content: JSON.stringify(obj)
    };
    console.log('ok', param);
    this.util.show();
    this.api.post_private('v1/languages/update', param).then(data => {
      this.util.hide();
      console.log(data);
      this.util.success(this.util.translate('Language updated !'));
      this.location.back();
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
