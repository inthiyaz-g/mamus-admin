/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  @ViewChild('myModal3') public myModal3: ModalDirective;
  dummy: any[] = [];
  totalUsers: any = 0;
  users: any[] = [];
  page: number = 1;
  inputString = '';
  appliedSearch = '';
  loading = false;
  errorMessage = '';
  private requestId = 0;
  constructor(
    private router: Router,
    public api: ApiService,
    public util: UtilService) {}

  ngOnInit(): void {
    this.getAllUsers();
  }

  ngOnDestroy(): void { this.requestId++; }

  async getAllUsers(): Promise<void> {
    const request = ++this.requestId;
    this.loading = true;
    this.errorMessage = '';
    this.dummy = Array(10);
    this.users = [];
    const params = new URLSearchParams({ page: String(this.page - 1) });
    if (this.appliedSearch) params.set('q', this.appliedSearch);
    try {
      const data: any = await this.api.get_private('v1/users/getAll?' + params.toString());
      if (request !== this.requestId) return;
      if (!data?.success || data.status !== 200 || !Array.isArray(data.data)) {
        throw new Error('User search unavailable');
      }
      this.users = data.data;
      this.totalUsers = Number(data.totalUsers) || 0;
      const lastPage = Math.max(1, Math.ceil(this.totalUsers / 10));
      if (this.page > lastPage) {
        this.page = lastPage;
        await this.getAllUsers();
      }
    } catch (error) {
      if (request !== this.requestId) return;
      this.totalUsers = 0;
      this.errorMessage = 'Users could not be loaded. Please try again.';
      this.util.apiErrorHandler(error);
    } finally {
      if (request === this.requestId) { this.dummy = []; this.loading = false; }
    }
  }

  pageChange(page: number) {
    if (this.loading || page < 1 || page > Math.max(1, Math.ceil(this.totalUsers / 10))) return;
    this.page = page;
    this.getAllUsers();
  }

  search() {
    this.inputString = this.inputString.trim().replace(/\s+/g, ' ');
    this.appliedSearch = this.inputString;
    this.page = 1;
    this.getAllUsers();
  }

  get rangeStart(): number { return this.totalUsers ? (this.page - 1) * 10 + 1 : 0; }
  get rangeEnd(): number { return Math.min(this.page * 10, this.totalUsers); }

  statusUpdate(item: any) {
    console.log(item);
    const text = item.status == 1 ? 'Deactive' : 'Active';
    Swal.fire({
      title: this.util.translate('Are you sure?'),
      text: this.util.translate('To') + ' ' + this.util.translate(text) + ' ' + this.util.translate('this user!'),
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
        const query = item.status == 1 ? 0 : 1;
        item.status = query;
        this.util.show();
        this.api.post_private('v1/profile/update', item).then((datas) => {
          this.util.hide();
          this.util.success('Updated');
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

  viewsInfo(item: any) {
    console.log(item);
    const param: NavigationExtras = {
      queryParams: {
        id: item
      }
    };
    this.router.navigate(['manage-users'], param);
  }

  deleteItem(item: any) {
    console.log(item);
    Swal.fire({
      title: this.util.translate('Are you sure?'),
      text: this.util.translate('To Delete this user!'),
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
        this.util.show();
        this.api.post_private('v1/users/deleteUser', item).then((datas) => {
          this.util.hide();
          this.util.success('Deleted');
          this.getAllUsers();
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

  addNew() {

  }



  exportCSV() {
    let data: any = [];
    this.users.forEach(element => {
      const info = {
        'id': this.util.replaceWithDot(element.id),
        'first_name': this.util.replaceWithDot(element.first_name),
        'last_name': this.util.replaceWithDot(element.last_name),
        'cover': this.util.replaceWithDot(element.cover),
        'country_code': this.util.replaceWithDot(element.country_code),
        'mobile': this.util.replaceWithDot(element.mobile),
        'email': this.util.replaceWithDot(element.email),
      }
      data.push(info);
    });
    const name = 'users';
    this.util.downloadFile(data, name, ['id', 'first_name', 'last_name', 'cover', 'country_code', 'mobile', 'email']);
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
      this.api.uploaCSV(files, 'v1/users/importData').subscribe((data: any) => {
        console.log('==>>>>>>', data.data);
        this.util.hide();
        this.myModal3.hide();
        this.util.success('Uploaded');
        this.getAllUsers();
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
    window.open('assets/sample/users.csv', '_blank');
  }

  clean() {
    this.inputString = '';
    this.appliedSearch = '';
    this.page = 1;
    this.getAllUsers();
  }
}
