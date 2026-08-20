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
  selector: 'app-cities',
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.scss']
})
export class CitiesComponent implements OnInit {
  openItem(arg0: any) {
    throw new Error('Method not implemented.');
  }
  @ViewChild('myModal3') public myModal3: ModalDirective;
  action = 'create';
  dummy = Array(10);
  cities: any[] = [];
  dummyCities: any[] = [];
  name: any = '';
  status = '-1';
  cityId: any = '';
  lat: any = '';
  lng: any = '';
  page: number = 1;

  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    this.getAllCities();
  }

  ngOnInit(): void {
  }

  getAllCities() {
    this.cities = [];
    this.dummy = Array(10);
    this.api.get_private('v1/cities/getAll').then((data: any) => {
      this.dummy = [];
      if (data && data.status && data.status == 200 && data.success) {
        console.log(">>>>>", data);
        if (data.data.length > 0) {
          this.cities = data.data;
          this.dummyCities = data.data;
          console.log("======", this.cities);
        }
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

  search(str: any) {
    this.resetChanges();
    console.log('string', str);
    this.cities = this.filterItems(str);
  }

  protected resetChanges = () => {
    this.cities = this.dummyCities;
  }

  filterItems(searchTerm: any) {
    return this.cities.filter((item) => {
      return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });
  }

  setFilteredItems() {
    console.log('clear');
    this.cities = [];
    this.cities = this.dummyCities;
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
        this.api.post_private('v1/cities/destroy', { id: item.id }).then((data: any) => {
          console.log(data);
          this.util.hide();
          if (data && data.status && data.status == 200) {
            this.getAllCities();
          }
        }).catch(error => {
          console.log(error);
          this.util.hide();
          this.util.apiErrorHandler(error);
        });
      }
    });

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
        this.cityId = val.id;
        const body = {
          id: this.cityId,
          status: val.status == 0 ? 1 : 0
        };
        console.log("========", body);
        this.util.show();
        this.api.post_private('v1/cities/update', body).then((data: any) => {
          this.util.hide();
          console.log("+++++++++++++++", data);
          if (data && data.status && data.status == 200 && data.success) {
            this.util.success(this.util.translate('Status Updated !'));
            this.getAllCities();
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
    this.cityId = id;
    const body = {
      id: this.cityId,
    };
    console.log("CAT BY ID => ", body);
    this.util.show();
    this.api.post_private('v1/cities/getById', body).then((data: any) => {
      console.log(data);
      this.util.hide();
      if (data && data.status && data.status == 200 && data.success) {
        this.name = data.data.name;
        this.status = data.data.status;
        this.lat = data.data.lat;
        this.lng = data.data.lng;
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
    this.name = '';
    this.status = '-1';
    this.lat = '';
    this.lng = '';
  }


  createCity() {
    if (this.name == '' || this.status == '-1' || this.name == null || this.status == null ||
      this.lat == '' || this.lng == '' || this.lat == null || this.lng == null) {
      this.util.error(this.util.translate('All Fields are required'));
    } else {
      const body = {
        name: this.name,
        status: this.status,
        lat: this.lat,
        lng: this.lng
      };
      this.util.show();
      this.api.post_private('v1/cities/create', body).then((data: any) => {
        console.log("+++++++++++++++", data);
        this.util.hide();
        if (data && data.status && data.status == 200 && data.success) {
          this.clearData();
          this.util.success(this.util.translate('City added !'));
          this.getAllCities();
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

  updateCity() {
    if (this.name == '' || this.status == '-1' || this.name == null || this.status == null ||
      this.lat == '' || this.lng == '' || this.lat == null || this.lng == null) {
      this.util.error(this.util.translate('All fields are required'));
    }
    else {

      const body = {
        id: this.cityId,
        name: this.name,
        status: this.status,
      };
      console.log("========", body);
      this.util.show();
      this.api.post_private('v1/cities/update', body).then((data: any) => {
        console.log("+++++++++++++++", data);
        this.util.hide();
        if (data && data.status && data.status == 200 && data.success) {
          this.clearData();
          this.util.success(this.util.translate('City Updated !'));
          this.action = 'create';
          this.getAllCities();
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
    this.cities.forEach(element => {
      const info = {
        'id': this.util.replaceWithDot(element.id),
        'name': this.util.replaceWithDot(element.name),
        'lat': this.util.replaceWithDot(element.lat),
        'lng': this.util.replaceWithDot(element.lng),
        'extra_field': this.util.replaceWithDot(element.extra_field),
        'status': this.util.replaceWithDot(element.status),
      }
      data.push(info);
    });
    const name = 'cities';
    this.util.downloadFile(data, name, ['id', 'name', 'lat', 'lng', 'extra_field', 'status']);
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
      this.api.uploaCSV(files, 'v1/cities/importData').subscribe((data: any) => {
        console.log('==>>>>>>', data.data);
        this.util.hide();
        this.myModal3.hide();
        this.util.success('Uploaded');
        this.getAllCities();
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
    window.open('assets/sample/cities.csv', '_blank');
  }
}
