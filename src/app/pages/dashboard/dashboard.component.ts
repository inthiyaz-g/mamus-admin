
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
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('myModal') public myModal: ModalDirective;

  dummy: any[] = [];
  dummyList: any[] = [];
  page: any = 1;
  recentOrders: any[] = [];
  recentUsers: any[] = [];
  complaints: any[] = [];

  users: any = 0;
  order: any = 0;
  stores: any = 0;
  products: any = 0;

  chartBarDataAppointments = {
    labels: [this.util.translate('Today')],
    datasets: [
      {
        label: this.util.translate('Today'),
        backgroundColor: '#f87979',
        data: [0]
      }
    ]
  };

  chartBarData2Appointments = {
    labels: [this.util.translate('Weekly')],
    datasets: [
      {
        label: this.util.translate('Weekly'),
        backgroundColor: '#f87979',
        data: [0]
      }
    ]
  };

  chartBarData3Appointments = {
    labels: [this.util.translate('Monthly')],
    datasets: [
      {
        label: this.util.translate('Monthly'),
        backgroundColor: '#f87979',
        data: [0]
      }
    ]
  };

  labelToday: any = '';
  labelWeekly: any = '';
  labelMonthly: any = '';


  lineChartOptions = {
    responsive: true,
  };
  lineChartColors: any[] = [
    {
      borderColor: 'blue',
      backgroundColor: 'rgba(0,0,255,0.3)',
    },
  ];
  lineChartLegend = true;
  lineChartPlugins = [];
  lineChartType = 'line';

  issue_With: any[] = [
    '',
    'Order',
    'Store',
    'Driver',
    'Product'
  ];

  name: any = '';
  email: any = '';
  message: any = '';

  reply: any = '';
  id: any = '';

  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router
  ) {
    this.getHome();
  }

  ngOnInit() {

  }

  openPage(url: any) {
    this.router.navigate([url]);
  }

  getHome() {
    this.dummy = Array(5);
    this.api.get_private('v1/home/getAdminDashboard').then((data: any) => {
      console.log(data);
      this.dummy = [];
      if (data && data.status && data.status == 200) {
        this.users = data.data.users;
        this.order = data.data.orders;
        this.stores = data.data.stores;
        this.products = data.data.products;


        if (data && data.data && data.data.today && data.data.today.label) {
          console.log('have today charts');
          data.data.today.label.forEach((element: any) => {
            this.chartBarDataAppointments.labels.push(element);
          });
          data.data.today.data.forEach((element: any) => {
            this.chartBarDataAppointments.datasets[0].data.push(element);
          });
        }

        this.labelToday = data.data.todayLabel;

        if (data && data.data && data.data.week && data.data.week.label) {
          console.log('have week charts');
          data.data.week.label.forEach((element: any) => {
            this.chartBarData2Appointments.labels.push(element);
          });
          data.data.week.data.forEach((element: any) => {
            this.chartBarData2Appointments.datasets[0].data.push(element);
          });
        }
        this.labelWeekly = data.data.weekLabel;

        if (data && data.data && data.data.month && data.data.month.label) {
          console.log('have month charts');
          data.data.month.label.forEach((element: any) => {
            this.chartBarData3Appointments.labels.push(element);
          });
          data.data.month.data.forEach((element: any) => {
            this.chartBarData3Appointments.datasets[0].data.push(element);
          });
        }

        console.log('Today ->', this.chartBarDataAppointments);
        console.log('Week ->', this.chartBarData2Appointments);
        console.log('Month ->', this.chartBarData3Appointments);
        this.labelMonthly = data.data.monthLabel;

        this.recentUsers = data.data.recentUsers;
        this.recentOrders = data.data.recentOrders;

        this.complaints = data.data.complaints;
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

  statusUpdate(item: any) {
    console.log(item);
    const text = item.status == 1 ? 'Deactive' : 'Active';
    Swal.fire({
      title: this.util.translate('Are you sure?'),
      text: this.util.translate('To') + ' ' + text + ' ' + this.util.translate('this user!'),
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
          this.recentUsers = this.recentUsers.filter(x => x.id != item.id);
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

  viewOrderInfo(item: any) {
    console.log(item);
    const param: NavigationExtras = {
      queryParams: {
        id: item
      }
    }
    this.router.navigate(['order-details'], param);
  }

  statusUpdateComplaints(item: any) {
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
        item.status = item.status == 0 ? 1 : 0
        const body = {
          id: item.id,
          status: item.status
        };
        console.log("========", body);
        this.util.show();
        this.api.post_private('v1/complaints/update', body).then((data: any) => {
          this.util.hide();
          console.log("+++++++++++++++", data);
          if (data && data.status && data.status == 200 && data.success) {
            this.util.success(this.util.translate('Status Updated !'));
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

  openItem(item: any) {
    console.log(item);
    this.name = item.userInfo.first_name + ' ' + item.userInfo.last_name;
    this.email = item.userInfo.email;
    this.message = item.short_message;
    this.id = item.id;
    this.myModal.show();
  }

  sendMail() {
    if (this.reply == '' || !this.reply) {
      this.util.error(this.util.translate('Please add your reply text'));
      return false;
    }
    const param = {
      id: this.id,
      mediaURL: this.api.imageUrl,
      subject: this.util.appName + ' ' + this.util.translate('Replied on your complaints'),
      thank_you_text: this.util.translate('You have received new mail on your complaints'),
      header_text: this.util.appName + ' ' + this.util.translate('Replied on your complaints'),
      email: this.email,
      from_username: this.name,
      to_respond: this.reply
    };
    this.util.show();
    console.log(param);
    this.api.post_private('v1/complaints/replyContactForm', param).then((data: any) => {
      console.log(data);
      this.util.hide();
      this.reply = '';
      this.myModal.hide();
      this.util.success(this.util.translate('Mail sent'));
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
