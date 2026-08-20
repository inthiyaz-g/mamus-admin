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
  selector: 'app-banners',
  templateUrl: './banners.component.html',
  styleUrls: ['./banners.component.scss']
})
export class BannersComponent implements OnInit {
  @ViewChild('myModal3') public myModal3: ModalDirective;
  action = 'create';
  dummy = Array(10);
  list: any[] = [];
  dummyList: any[] = [];
  message: any = '';
  status = '-1';
  cover: any = '';
  page: number = 1;
  bannerId: any = '';
  cities: any[] = [];
  cityId: any = '';
  position: any = '';
  type: any = '';
  link: any = 0;
  from: any = '';
  to: any = '';
  search: any = '';

  products: any[] = [];
  dummyProducts: any[] = [];

  categories: any[] = [];
  dummyCategories: any[] = [];
  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    this.getAll();
  }
  ngOnInit(): void {
  }

  changeType() {
    this.search = '';
    this.link = '';
  }

  searchCate(str: any) {
    console.log(str);
    if (str && str != '') {
      this.categories = this.dummyCategories.filter((item) => {
        return item.name.toLowerCase().indexOf(str.toLowerCase()) > -1;
      });
    } else {
      this.categories = [];
    }
  }

  selectCate(item: any) {
    this.link = item.id;
    this.search = item.name;
    this.categories = [];
  }

  selectProduct(item: any) {
    this.link = item.id;
    this.search = item.name;
    this.products = [];
  }

  searchProduct(str: any) {
    console.log(str);
    if (str && str != '') {
      this.products = this.dummyProducts.filter((item) => {
        return item.name.toLowerCase().indexOf(str.toLowerCase()) > -1;
      });
    } else {
      this.products = [];
    }
  }


  getAll() {
    ///getAll
    this.list = [];
    this.dummy = Array(10);
    this.api.get_private('v1/banners/getAll').then((data: any) => {
      this.dummy = [];
      if (data && data.status && data.status == 200 && data.success) {
        console.log(">>>>>", data);
        if (data.data.length > 0) {
          this.list = data.data;
          this.dummyList = data.data;
          console.log("======", this.list);
        }
        this.cities = data.cities;
        this.dummyProducts = data.products;
        this.dummyCategories = data.categories;
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


  deleteItem(item: any) {
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
        console.log(item);
        console.log(item);
        this.util.show();
        this.api.post_private('v1/banners/destroy', { id: item.id }).then((data: any) => {
          console.log(data);
          this.util.hide();
          if (data && data.status && data.status == 200) {
            this.getAll();
          }
        }).catch(error => {
          console.log(error);
          this.util.hide();
          this.util.apiErrorHandler(error);
        });
      }
    });

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


  statusUpdate(val: any) {
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
        this.bannerId = val.id;
        const body = {
          id: this.bannerId,
          status: val.status == 0 ? 1 : 0
        };
        console.log("========", body);
        this.util.show();
        this.api.post_private('v1/banners/update', body).then((data: any) => {
          this.util.hide();
          console.log("+++++++++++++++", data);
          if (data && data.status && data.status == 200 && data.success) {
            this.util.success(this.util.translate('Status Updated !'));
            this.getAll();
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

  }

  updateInfo(id: any) {
    this.action = 'update';
    this.bannerId = id;
    const body = {
      id: this.bannerId,
    };
    console.log("CAT BY ID => ", body);
    this.util.show();
    this.api.post_private('v1/banners/getById', body).then((data: any) => {
      console.log(data);
      this.util.hide();
      if (data && data.status && data.status == 200 && data.success) {
        const info = data.data;
        this.cityId = info.city_id;
        this.cover = info.cover;
        this.position = info.position;
        this.type = info.type;
        this.link = info.link;
        this.from = info.from;
        this.to = info.to;
        this.status = info.status;
        this.message = info.message;

        if (info.type == 0) {
          const cate = this.dummyCategories.filter(x => x.id == info.link);
          console.log('selected cate', cate);
          if (cate && cate.length) {
            this.search = cate[0].name;
          }
        }

        if (info.type == 1) {
          const products = this.dummyProducts.filter(x => x.id == info.link);
          console.log('selected products', products);
          if (products && products.length) {
            this.search = products[0].name;
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

  clearData() {
    console.log("CLEAR DATA");
    this.cover = '';
    this.message = '';
    this.status = '-1';
    this.link = '';
    this.bannerId = '';
    this.search = '';
    this.categories = [];
    this.products = [];
    this.position = 0;
    this.type = 0;
    this.cityId = '';
    this.from = '';
    this.to = '';
  }


  createCategory() {
    if (this.status == '-1' || this.message == null || this.status == null || this.cover == '' || this.position == '' || this.position == null ||
      this.type == '' || this.type == null || this.link == '' || this.link == null || this.cityId == '' || this.cityId == null ||
      this.from == '' || this.from == null || this.to == '' || this.to == null || this.message == '' || this.message == null) {
      this.util.error(this.util.translate('All Fields are required'));
    } else {
      const body = {
        city_id: this.cityId,
        cover: this.cover,
        position: this.position,
        link: this.link,
        type: this.type,
        message: this.message,
        from: this.from,
        to: this.to,
        status: this.status,
      };
      this.util.show();
      this.api.post_private('v1/banners/create', body).then((data: any) => {
        console.log("+++++++++++++++", data);
        this.util.hide();
        if (data && data.status && data.status == 200 && data.success) {
          this.clearData();
          this.util.success(this.util.translate('Added !'));
          this.getAll();
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

  updateCategory() {
    console.log(this.bannerId);
    console.log(this.cityId);
    console.log(this.cover);
    console.log(this.position);
    console.log(this.link);
    console.log(this.type);
    console.log(this.message);
    console.log(this.from);
    console.log(this.to);
    console.log(this.status);
    if (this.message == null || this.cover == '' ||
      this.link == '' || this.link == null || this.cityId == '' || this.cityId == null ||
      this.from == '' || this.from == null || this.to == '' || this.to == null || this.message == '' || this.message == null) {
      this.util.error(this.util.translate('All fields are required'));
    }
    else {

      const body = {
        id: this.bannerId,
        city_id: this.cityId,
        cover: this.cover,
        position: this.position,
        link: this.link,
        type: this.type,
        message: this.message,
        from: this.from,
        to: this.to,
        status: this.status,
      };
      console.log("========", body);
      this.util.show();
      this.api.post_private('v1/banners/update', body).then((data: any) => {
        console.log("+++++++++++++++", data);
        this.util.hide();
        if (data && data.status && data.status == 200 && data.success) {
          this.clearData();
          this.util.success(this.util.translate('Updated !'));
          this.action = 'create';
          this.getAll();
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

  exportCSV() {
    let data: any = [];
    this.list.forEach(element => {
      const info = {
        'id': this.util.replaceWithDot(element.id),
        'city_id': this.util.replaceWithDot(element.city_id),
        'cover': this.util.replaceWithDot(element.cover),
        'from': this.util.replaceWithDot(element.from),
        'link': this.util.replaceWithDot(element.link),
        'message': this.util.replaceWithDot(element.message),
        'position': this.util.replaceWithDot(element.position),
        'status': this.util.replaceWithDot(element.status),
        'to': this.util.replaceWithDot(element.to),
        'type': this.util.replaceWithDot(element.type),
      }
      data.push(info);
    });
    const name = 'banners';
    this.util.downloadFile(data, name, ['id', 'city_id', 'cover', 'from', 'link', 'message', 'position', 'status', 'to', 'type']);
  }


  importCSV() {
    this.myModal3.show();
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
      this.api.uploaCSV(files, 'v1/banners/importData').subscribe((data: any) => {
        console.log('==>>>>>>', data.data);
        this.util.hide();
        this.myModal3.hide();
        this.util.success('Uploaded');
        this.getAll();
      }, err => {
        console.log(err);
        this.util.hide();
        this.util.apiErrorHandler(err);
      });
    } else {
      console.log('no');
    }
  }

  downloadSample() {
    window.open('assets/sample/banners.csv', '_blank');
  }
}
