
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
  todayOrders: number = 0;
  todayCompletedOrders: number = 0;
  todayCancelledOrders: number = 0;
  todayPendingOrders: number = 0;
  todayRevenue: number = 0;
  pendingExpressOrders: number = 0;
  openComplaints: number = 0;
  isLoading: boolean = false;
  lastUpdated: Date | null = null;

  chartBarDataAppointments: any = {
    labels: [],
    datasets: [
      {
        label: this.util.translate('Today'),
        backgroundColor: '#e5313d',
        borderRadius: 8,
        data: []
      }
    ]
  };

  chartBarData2Appointments: any = {
    labels: [],
    datasets: [
      {
        label: this.util.translate('Weekly'),
        backgroundColor: '#276ef1',
        borderRadius: 8,
        data: []
      }
    ]
  };

  chartBarData3Appointments: any = {
    labels: [],
    datasets: [
      {
        label: this.util.translate('Monthly'),
        backgroundColor: '#7c3aed',
        borderRadius: 8,
        data: []
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
    this.isLoading = true;
    this.resetCharts();
    this.api.get_private('v1/home/getAdminDashboard').then((data: any) => {
      this.dummy = [];
      if (data && data.status && data.status == 200) {
        this.users = data.data.users;
        this.order = data.data.orders;
        this.stores = data.data.stores;
        this.products = data.data.products;


        this.setChartData(this.chartBarDataAppointments, data.data.today);

        this.labelToday = data.data.todayLabel;

        this.setChartData(this.chartBarData2Appointments, data.data.week);
        this.labelWeekly = data.data.weekLabel;

        this.setChartData(this.chartBarData3Appointments, data.data.month);
        this.labelMonthly = data.data.monthLabel;

        this.recentUsers = data.data.recentUsers;
        this.recentOrders = data.data.recentOrders;

        this.complaints = data.data.complaints;
        const summary = data.data.todayOrderSummary || {};
        this.todayOrders = Number(summary.total || 0);
        this.todayCompletedOrders = Number(summary.completed || 0);
        this.todayCancelledOrders = Number(summary.cancelled || 0);
        this.todayPendingOrders = Number(summary.pending || 0);
        this.todayRevenue = Number(summary.revenue || 0);
        this.pendingExpressOrders = Number(data.data.pendingExpressOrders || 0);
        this.openComplaints = Number(data.data.openComplaints || 0);
        this.lastUpdated = new Date();
      }
      this.isLoading = false;
    }, error => {
      this.dummy = [];
      this.isLoading = false;
      this.util.apiErrorHandler(error);
    }).catch(error => {
      this.dummy = [];
      this.isLoading = false;
      this.util.apiErrorHandler(error);
    });
  }

  refreshDashboard() {
    if (!this.isLoading) {
      this.getHome();
    }
  }

  deliveryLabel(order: any): string {
    if (order?.delivery_type === 'instant') {
      return this.util.translate('Instant');
    }

    return this.util.translate('Scheduled');
  }

  orderStatus(order: any): string {
    const statuses = this.storeStatuses(order);

    if (statuses.includes('refund') || statuses.includes('refunded')) return 'refunded';
    if (statuses.includes('rejected')) return 'rejected';
    if (statuses.includes('cancelled') || statuses.includes('canceled')) return 'cancelled';
    if (statuses.length > 0 && statuses.every((status: string) => status === 'delivered')) return 'delivered';
    if (statuses.includes('ongoing')) return 'ongoing';
    if (statuses.includes('accepted')) return 'accepted';

    return 'created';
  }

  orderStatusLabel(order: any): string {
    const labels: { [key: string]: string } = {
      accepted: 'Accepted',
      cancelled: 'Cancelled',
      created: 'Created',
      delivered: 'Delivered',
      ongoing: 'Ongoing',
      refunded: 'Refunded',
      rejected: 'Rejected',
    };

    return this.util.translate(labels[this.orderStatus(order)] || 'Created');
  }

  getStoreNames(storeInfo: any[]): string {
    return (storeInfo || []).map((store: any) => store.name).filter(Boolean).join(', ');
  }

  private resetCharts() {
    this.chartBarDataAppointments = this.createChartData(this.util.translate('Today'), '#e5313d');
    this.chartBarData2Appointments = this.createChartData(this.util.translate('Weekly'), '#276ef1');
    this.chartBarData3Appointments = this.createChartData(this.util.translate('Monthly'), '#7c3aed');
  }

  private createChartData(label: string, color: string) {
    return {
      labels: [] as any[],
      datasets: [{ label, backgroundColor: color, borderRadius: 8, data: [] as any[] }]
    };
  }

  private setChartData(chart: any, source: any) {
    chart.labels = Array.isArray(source?.label) ? source.label : [];
    chart.datasets[0].data = Array.isArray(source?.data) ? source.data : [];
  }

  private storeStatuses(order: any): string[] {
    const rawStatus = order?.status;
    if (Array.isArray(rawStatus)) {
      return rawStatus.map((item: any) => String(item?.status || '').toLowerCase()).filter(Boolean);
    }

    if (typeof rawStatus !== 'string' || rawStatus.trim() === '') return [];

    try {
      const parsed = JSON.parse(rawStatus);
      return Array.isArray(parsed)
        ? parsed.map((item: any) => String(item?.status || '').toLowerCase()).filter(Boolean)
        : [];
    } catch {
      return [rawStatus.toLowerCase()];
    }
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
