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
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-stores',
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.scss']
})
export class StoresComponent implements OnInit {
  @ViewChild('myModal3') public myModal3: ModalDirective;
  @ViewChild('myModal2') public myModal2: ModalDirective;
  @ViewChild('largeModal') public largeModal: ModalDirective;
  @ViewChild('editInfoModal') public editInfoModal: ModalDirective;
  dummy: any[] = [];
  list: any[] = [];
  dummyList: any[] = [];

  page: number = 1;
  cities: any[] = [];
  selectedCities: any = '';

  action: any = 'create';

  id: any;
  new: boolean;
  address: any = '';


  cover: any = '';
  gender: any = 1;

  name: any = '';
  descritions: any = '';
  haveData: boolean = false;
  time: any = '';
  commission: any = '';
  email: any = '';
  openTime: any = '';
  closeTime: any = '';
  fname: any = '';
  lat: any = '';
  lng: any = '';
  lname: any = '';
  password: any = '';
  phone: any = '';
  city: any = '';
  totalSales: any = 0;
  totalOrders: any = 0;
  reviews: any[] = [];

  fileURL: any;
  orders: any[] = [];
  country_code: any = '';

  countries: any[] = [];
  dummyCC: any[] = [];
  dummyLoad: any[] = [];
  displayed: any = '';
  zipcode: any = '';

  submited: boolean = false;
  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router
  ) {
    this.getStores();
    this.getAllCities();
  }

  getStores() {
    this.dummy = Array(5);
    this.list = [];
    this.dummyList = [];
    this.api.get_private('v1/store/getStores').then((data: any) => {
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

  getTime(time: any) {
    return moment('1997-07-15 ' + time).format('hh:mm A');
  }

  getAllCities() {
    this.cities = [];
    this.api.get_private('v1/cities/getAll').then((data: any) => {
      this.dummy = [];
      if (data && data.status && data.status == 200 && data.success) {
        console.log(">>>>>", data);
        if (data.data.length > 0) {
          this.cities = data.data;
          console.log("======", this.cities);
        }
      }
    }, error => {
      console.log('Error', error);
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log('Err', error);
      this.util.apiErrorHandler(error);
    });
  }


  ngOnInit(): void {
  }

  openStore(item: any) {
    const param: NavigationExtras = {
      queryParams: {
        id: item.uid
      }
    };
    this.router.navigate(['manage-store'], param);
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
          uid: item.uid,
          status: item.status == 0 ? 1 : 0
        };
        console.log("========", body);
        this.util.show();
        this.api.post_private('v1/store/updateStatus', body).then((data: any) => {
          this.util.hide();
          console.log("+++++++++++++++", data);
          if (data && data.status && data.status == 200 && data.success) {
            this.util.success(this.util.translate('Status Updated !'));
            this.getStores();
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
    //store/updateStatus
  }

  search(str: any) {
    this.resetChanges();
    console.log('string', str);
    this.list = this.filterItems(str);
  }

  protected resetChanges = () => {
    this.list = this.dummyList;
  }

  filterItems(searchTerm: any) {
    return this.list.filter((item) => {
      return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });
  }

  setFilteredItems() {
    console.log('clear');
    this.list = [];
    this.list = this.dummyList;
  }

  addNew() {
    this.myModal2.show();
  }

  exportCSV() {
    let data: any = [];
    this.list.forEach(element => {
      const info = {
        'id': this.util.replaceWithDot(element.id),
        'name': this.util.replaceWithDot(element.name),
        'owner': this.util.replaceWithDot(element.first_name) + ' ' + this.util.replaceWithDot(element.last_name),
        'address': this.util.replaceWithDot(element.address),
        'certificate_type': this.util.replaceWithDot(element.certificate_type),
        'certificate_url': this.util.replaceWithDot(element.certificate_url),
        'city_name': this.util.replaceWithDot(element.city_name),
        'open_time': this.util.replaceWithDot(element.open_time),
        'close_time': this.util.replaceWithDot(element.close_time),
        'commission': this.util.replaceWithDot(element.commission),
        'cover': this.util.replaceWithDot(element.cover),
        'descriptions': this.util.replaceWithDot(element.descriptions),
        'lat': this.util.replaceWithDot(element.lat),
        'lng': this.util.replaceWithDot(element.lng),
        'mobile': this.util.replaceWithDot(element.mobile),
        'rating': this.util.replaceWithDot(element.rating),
        'total_rating': this.util.replaceWithDot(element.total_rating),
        'status': this.util.replaceWithDot(element.status),
        'zipcode': this.util.replaceWithDot(element.zipcode),
      }
      data.push(info);
    });
    const name = 'stores';
    this.util.downloadFile(data, name, ['id', 'name', 'owner', 'address', 'certificate_type', 'certificate_url', 'city_name', 'open_time', 'close_time',
      'commission', 'cover', 'descriptions', 'lat', 'lng', 'mobile', 'rating', 'total_rating', 'status', 'zipcode']);
  }


  filter() {
    console.log(this.selectedCities);
    this.list = this.dummyList.filter(x => x.cid == this.selectedCities);
  }

  clearFilter() {
    this.selectedCities = '';
    this.list = this.dummyList;
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
      this.api.uploaCSV(files, 'v1/stores/importData').subscribe((data: any) => {
        console.log('==>>>>>>', data.data);
        this.util.hide();
        this.myModal3.hide();
        this.util.success('Uploaded');
        this.getStores();
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
    window.open('assets/sample/store.csv', '_blank');
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

  openCountryModel() {
    console.log('open moda');
    this.dummyLoad = Array(10);
    setTimeout(() => {
      this.dummyLoad = [];
      this.dummyCC = this.util.countrys;
      this.countries = this.dummyCC;
      this.util.countrys;
      console.log(this.dummyCC);
    }, 500);
    this.largeModal.show();
  }

  onSearchChange(events: any) {
    console.log(events);
    if (events != '') {
      this.countries = this.dummyCC.filter((item) => {
        return item.country_name.toLowerCase().indexOf(events.toLowerCase()) > -1;
      });
    } else {
      this.countries = this.dummyCC;
    }
  }

  useCode() {
    console.log(this.country_code);
    this.displayed = '+' + this.country_code;
    this.largeModal.hide();
  }

  saveChanges() {
    console.log(this.submited);
    this.submited = true;

    if (this.fname == '' || this.fname == null || this.lname == '' || this.lname == null || this.email == '' || this.email == null ||
      this.password == '' || this.password == null || this.country_code == '' || this.country_code == null || this.phone == '' || this.phone == null || this.name == '' || this.name == null ||
      this.address == null || this.address == '' || this.lat == null || this.lat == '' || this.lng == '' || this.lng == null || this.closeTime == null || this.closeTime == '' ||
      this.openTime == '' || this.openTime == null || this.commission == null || this.commission == '' || this.descritions == '' || this.descritions == null || this.city == '' || this.city == null ||
      this.zipcode == '' || this.zipcode == null) {
      this.util.error('All fields are required');
      return false;
    }
    const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if (!regex.test(this.email)) {
      this.util.error(this.util.translate('Please enter valid Email ID'));
      return false;
    }
    if (this.cover == '' || this.cover == null) {
      this.util.error('Cover Image is missing');
      return false;
    }

    console.log(typeof this.country_code)
    const cc: string = (this.country_code).toString();
    if (!cc.includes('+')) {
      this.country_code = '+' + this.country_code
    };
    const param = {
      first_name: this.fname,
      last_name: this.lname,
      mobile: this.phone,
      email: this.email,
      country_code: this.country_code,
      password: this.password
    };
    this.util.show();
    this.api.post_private('v1/store/createStoreProfile', param).then((data: any) => {
      this.util.hide();
      console.log(data);
      if (data.status == 500) {
        this.util.error(data.message);
      }
      if (data && data.status && data.status == 200 && data.user && data.user.id) {
        this.createStoreProfile(data.user.id);
      } else if (data && data.error && data.error.msg) {
        this.util.error(data.error.msg);
      } else if (data && data.error && data.error.message == 'Validation Error.') {
        for (let key in data.error[0]) {
          console.log(data.error[0][key][0]);
          this.util.error(data.error[0][key][0]);
        }
      } else {
        this.util.error(this.util.translate('Something went wrong'));
      }
    }, error => {
      console.log(error);
      this.util.hide();
      if (error && error.error && error.error.status == 500 && error.error.message) {
        this.util.error(error.error.message);
      } else if (error && error.error && error.error.error && error.error.status == 422) {
        for (let key in error.error.error) {
          console.log(error.error.error[key][0]);
          this.util.error(error.error.error[key][0]);
        }
      } else {
        this.util.error(this.util.translate('Something went wrong'));
      }
    }).catch(error => {
      console.log(error);
      this.util.hide();
      if (error && error.error && error.error.status == 500 && error.error.message) {
        this.util.error(error.error.message);
      } else if (error && error.error && error.error.error && error.error.status == 422) {
        for (let key in error.error.error) {
          console.log(error.error.error[key][0]);
          this.util.error(error.error.error[key][0]);
        }
      } else {
        this.util.error(this.util.translate('Something went wrong'));
      }
    });

  }

  createStoreProfile(uid: any) {

    const param = {
      uid: uid,
      name: this.name,
      mobile: this.phone,
      lat: this.lat,
      lng: this.lng,
      address: this.address,
      descriptions: this.descritions,
      cover: this.cover,
      commission: this.commission,
      open_time: this.openTime,
      close_time: this.closeTime,
      cid: this.city,
      zipcode: this.zipcode,
      status: 1
    }

    this.util.show();
    this.api.post_private('v1/store/create', param).then((data: any) => {
      console.log(data);
      this.util.hide();
      if (data && data.status && data.status == 200 && data.data) {
        this.util.success(this.util.translate('Store Created'));
        this.myModal2.hide();
        this.getStores();
      }
    }, error => {
      this.util.hide();
      console.log(error);
      this.util.apiErrorHandler(error);
    }).catch(error => {
      this.util.hide();
      console.log(error);
      this.util.apiErrorHandler(error);
    });
  }

  editInfo(item: any) {
    console.log('item', item);
    this.id = item.id;
    this.cover = item.cover;
    this.name = item.name;
    this.address = item.address;
    this.lat = item.lat;
    this.lng = item.lng;
    this.openTime = item.open_time;
    this.closeTime = item.close_time;
    this.commission = item.commission;
    this.descritions = item.descriptions
    this.zipcode = item.zipcode;
    this.city = item.cid;
    this.editInfoModal.show();
  }

  updateChanges() {
    if (this.name == '' || this.address == '' || this.lat == '' || this.lng == '' || this.descritions == '' || this.openTime == '' || this.closeTime == ''
      || !this.openTime || !this.closeTime || this.zipcode == '' || !this.zipcode) {
      this.util.error(this.util.translate('All Fields are required'));
      return false;
    }


    if (!this.cover || this.cover == '') {
      this.util.error(this.util.translate('Please add your cover image'));
      return false;
    }

    const param = {
      name: this.name,
      address: this.address,
      descriptions: this.descritions,
      lat: this.lat,
      lng: this.lng,
      cover: this.cover,
      open_time: this.openTime,
      close_time: this.closeTime,
      id: this.id,
      commission: this.commission,
      cid: this.city,
      zipcode: this.zipcode,
    };

    this.util.show();
    this.api.post_private('v1/store/update', param).then((datas: any) => {
      console.log(datas);
      this.util.hide();
      if (datas && datas.status == 200) {
        this.editInfoModal.hide();
        this.getStores();
      } else {
        this.util.error(this.util.translate('Something went wrong'));
      }

    }, error => {
      this.util.hide();
      console.log(error);
      this.util.apiErrorHandler(error);
    }).catch(error => {
      this.util.hide();
      console.log(error);
      this.util.apiErrorHandler(error);
    });
  }
}
