/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { CollapseDirective } from 'ngx-bootstrap/collapse';
import * as moment from 'moment';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { orderBy } from 'lodash';

@Component({
  selector: 'app-manage-store',
  templateUrl: './manage-store.component.html',
  styleUrls: ['./manage-store.component.scss']
})
export class ManageStoreComponent implements OnInit {
  private _isCollapsed: boolean = true;
  set isCollapsed(value) {
    this._isCollapsed = value;
  }
  get isCollapsed() {
    if (this.collapseRef) {
      // temp fix for "overflow: hidden"
      if (getComputedStyle(this.collapseRef.nativeElement).getPropertyValue('display') == 'flex') {
        this.renderer.removeStyle(this.collapseRef.nativeElement, 'overflow');
      }
    }
    return this._isCollapsed;
  }

  @ViewChild(CollapseDirective, { read: ElementRef, static: false }) collapse !: CollapseDirective;

  collapseRef: any;

  tabId: any;

  newOrders: any[] = [];
  dummyOrders = Array(5);
  olders: any[] = [];
  storeId: any = '';

  public barChartOptions: any = {
    responsive: true,
  };
  public barChartType = 'bar';
  public doughnutChartType = 'doughnut';
  todayStates = {
    total: 0,
    totalSold: 0,
    label: ''
  }

  weeekStates = {
    label: '',
    total: 0,
    totalSold: 0
  }

  monthStats = {
    label: '',
    total: 0,
    totalSold: 0
  }

  todayStatesRejected = {
    total: 0,
    totalSold: 0,
  }

  weeekStatesRejected = {
    total: 0,
    totalSold: 0
  }

  monthStatsRejected = {
    total: 0,
    totalSold: 0
  }

  topProducts: any[] = [];
  monthsChartData: any[] = [];
  weeksChartData: any[] = [];
  todayChartData: any[] = [];
  complaints: any[] = [];
  reasons: any[] = [
    'The product arrived too late',
    'The product did not match the description',
    'The purchase was fraudulent',
    'The product was damaged or defective',
    'The merchant shipped the wrong item',
    'Wrong Item Size or Wrong Product Shipped',
    'Driver arrived too late',
    'Driver behavior',
    'Store Vendors behavior',
    'Issue with Payment Amout',
    'Others',
  ];

  issue_With: any[] = [
    '',
    'Order',
    'Store',
    'Driver',
    'Product'
  ];

  barChartDataMonths = {
    labels: [this.util.translate('Monthly')],
    datasets: [
      {
        label: this.util.translate('Monthly'),
        backgroundColor: '#f87979',
        data: [0]
      }
    ]
  };

  barChartDataWeeks = {
    labels: [this.util.translate('Weekly')],
    datasets: [
      {
        label: this.util.translate('Weekly'),
        backgroundColor: '#f87979',
        data: [0]
      }
    ]
  };

  barChartDataToday = {
    labels: [this.util.translate('Today')],
    datasets: [
      {
        label: this.util.translate('Today'),
        backgroundColor: '#f87979',
        data: [0]
      }
    ]
  };

  doughnutChartData = {
    labels: [this.util.translate('Weekly')],
    datasets: [
      {
        label: this.util.translate('Top Charts'),
        backgroundColor: '#f87979',
        data: [0]
      }
    ]
  };

  // public doughnutChartType: ChartType = 'doughnut';

  public topProductsChartData: any[] = [];
  monthLabel: any = '';

  dummyReviews: any[] = [];
  reviews: any[] = [];
  pageReviews: number = 1;

  products: any[] = [];
  dummyLoadProducts = Array(20);
  dummyProducts: any[] = [];
  pageProducts: number = 1;

  orderPage: number = 1;
  storeTotalOrders: any = 0;
  constructor(
    private renderer: Renderer2,
    public util: UtilService,
    public api: ApiService,
    public route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {
    this.route.queryParams.subscribe((data: any) => {
      console.log(data);
      if (data && data.id) {
        this.storeId = data.id;
        this.changeView(1);
      } else {
        this.location.back();
      }
    })

  }

  ngOnInit() { }

  ngAfterViewChecked(): void {
    this.collapseRef = this.collapse;
  }

  changeView(tabId: any) {
    this.tabId = tabId;
    console.log('tab id', this.tabId);
    if (this.tabId == 1) {
      this.getOrders();
    } else if (this.tabId == 2) {
      this.getGraph();
    } else if (this.tabId == 3) {
      this.getReviews();
    } else if (this.tabId == 4) {
      this.getProducts();
    }
  }

  pageChange(event: any) {
    console.log(event);
    this.orderPage = event;
    console.log('page->', this.orderPage)
    this.getOrders();
  }

  getOrders() {
    console.log('fetching orders');
    const param = {
      id: this.storeId,
      page: (this.orderPage - 1)
    };
    this.newOrders = [];
    this.dummyOrders = Array(5);
    this.api.post_private('v1/orders/getByStoreIdsAdmin', param).then((data: any) => {
      console.log('by store id', data);
      this.dummyOrders = [];
      this.newOrders = [];
      this.olders = [];
      if (data && data.status && data.status == 200 && data.data.length > 0) {
        this.storeTotalOrders = data.totalOrders;
        data.data.forEach(async (element: any, index: any) => {
          if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.orders)) {
            element.orders = JSON.parse(element.orders);
            element.date_time = moment(element.date_time).format('dddd, MMMM Do YYYY');
            element.orders = await element.orders.filter((x: any) => x.store_id == this.storeId);
            if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.status)) {
              const info = JSON.parse(element.status);
              const selected = info.filter((x: any) => x.id == this.storeId);
              if (selected && selected.length) {
                element.orders.forEach((order: any) => {
                  if (order.variations && order.variations != '' && typeof order.variations == 'string') {
                    console.log('strings', element.id);
                    order.variations = JSON.parse(order.variations);
                    console.log(order['variant']);
                    if (order["variant"] == undefined) {
                      order['variant'] = 0;
                    }
                  }
                });

                const status = selected[0].status;
                element['storeStatus'] = status;
                this.newOrders.push(element);
              }
            }
          }
        });
        console.log('older', this.olders);
        console.log('new ', this.newOrders);

      }
    }, error => {
      console.log(error);
      this.dummyOrders = [];
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.dummyOrders = [];
      this.util.apiErrorHandler(error);
    });
  }

  getGraph() {
    console.log('fetching graphs');
    this.api.post_private('v1/orders/getStoreStatsDataAdmin', { id: this.storeId }).then((data: any) => {
      console.log(data);
      if (data && data.status && data.status == 200 && data.data) {
        const week = data.data.week.data;
        const month = data.data.month.data;
        const today = data.data.today.data;
        this.complaints = data.data.complaints;
        this.weeekStates.label = data.data.week.label;
        this.todayStates.label = data.data.today.label;
        this.monthStats.label = data.data.month.label;
        console.log(week);
        let weekDeliveredOrder: any[] = [];
        let weekDeliveredTotal: any = 0;
        let weekRejectedOrder: any[] = [];
        let weekRejectedTotal: any = 0;

        let monthDeliveredOrder: any[] = [];
        let monthDeliveredTotal: any = 0;
        let monthRejectOrder: any[] = [];
        let monthRejectedTotal: any = 0;

        let todayDeliveredOrder: any[] = [];
        let todayDeliveredTotal: any = 0;
        let todayRejectOrder: any[] = [];
        let todayRejectedTotal: any = 0;

        let allOrders: any[] = [];

        today.forEach(async (element: any) => {
          if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.orders)) {
            element.orders = JSON.parse(element.orders);
            element.orders = element.orders.filter((x: any) => x.store_id == this.storeId);
            if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.status)) {
              const info = JSON.parse(element.status);
              const selected = info.filter((x: any) => x.id == this.storeId);
              if (selected && selected.length) {
                element.orders.forEach((element: any) => {
                  allOrders.push(element);
                });
                const status = selected[0].status;

                if (status == 'delivered') {
                  element.orders.forEach((order: any) => {
                    let price = 0;
                    if (order.variations && order.variations != '' && typeof order.variations == 'string') {
                      console.log('strings', element.id);
                      order.variations = JSON.parse(order.variations);
                      console.log(order['variant']);
                      if (order["variant"] == undefined) {
                        order['variant'] = 0;
                      }
                    }
                    if (order && order.discount == 0) {
                      if (order.size == 1) {
                        if (order.variations[0].items[order.variant].discount && order.variations[0].items[order.variant].discount != 0) {
                          price = price + (parseFloat(order.variations[0].items[order.variant].discount) * order.quantiy);
                        } else {
                          price = price + (parseFloat(order.variations[0].items[order.variant].price) * order.quantiy);
                        }
                      } else {
                        price = price + (parseFloat(order.original_price) * order.quantiy);
                      }
                    } else {
                      if (order.size == 1) {
                        if (order.variations[0].items[order.variant].discount && order.variations[0].items[order.variant].discount != 0) {
                          price = price + (parseFloat(order.variations[0].items[order.variant].discount) * order.quantiy);
                        } else {
                          price = price + (parseFloat(order.variations[0].items[order.variant].price) * order.quantiy);
                        }
                      } else {
                        price = price + (parseFloat(order.sell_price) * order.quantiy);
                      }
                    }
                    todayDeliveredTotal = todayDeliveredTotal + price;
                    todayDeliveredOrder.push(order);
                  });
                }
                if (status == 'rejected' || status == 'cancelled') {
                  element.orders.forEach((order: any) => {
                    let price = 0;
                    if (order.variations && order.variations != '' && typeof order.variations == 'string') {
                      console.log('strings', element.id);
                      order.variations = JSON.parse(order.variations);
                      console.log(order['variant']);
                      if (order["variant"] == undefined) {
                        order['variant'] = 0;
                      }
                    }
                    if (order && order.discount == 0) {
                      if (order.size == 1) {
                        if (order.variations[0].items[order.variant].discount && order.variations[0].items[order.variant].discount != 0) {
                          price = price + (parseFloat(order.variations[0].items[order.variant].discount) * order.quantiy);
                        } else {
                          price = price + (parseFloat(order.variations[0].items[order.variant].price) * order.quantiy);
                        }
                      } else {
                        price = price + (parseFloat(order.original_price) * order.quantiy);
                      }
                    } else {
                      if (order.size == 1) {
                        if (order.variations[0].items[order.variant].discount && order.variations[0].items[order.variant].discount != 0) {
                          price = price + (parseFloat(order.variations[0].items[order.variant].discount) * order.quantiy);
                        } else {
                          price = price + (parseFloat(order.variations[0].items[order.variant].price) * order.quantiy);
                        }
                      } else {
                        price = price + (parseFloat(order.sell_price) * order.quantiy);
                      }
                    }
                    todayRejectedTotal = todayRejectedTotal + price;
                    todayRejectOrder.push(order);
                  });
                }
              }
            }
          }
        });

        const todaysDateChart = [...new Set(today.map((item: any) => moment(item.date_time).format('DD-MMM hh: a')))];
        let todaysDataChart: any[] = [];
        todaysDateChart.forEach(dt => {
          const item = {
            date: dt,
            sells: today.filter((x: any) => moment(x.date_time).format('DD-MMM hh: a') == dt),
            totalSell: 0
          }
          todaysDataChart.push(item)
        });
        todaysDataChart.forEach(data => {
          let orderTotal = 0;
          data.sells.forEach((element: any) => {
            element.orders.forEach((order: any) => {
              let price = 0;
              if (order.variations && order.variations != '' && typeof order.variations == 'string') {
                console.log('strings', element.id);
                order.variations = JSON.parse(order.variations);
                console.log(order['variant']);
                if (order["variant"] == undefined) {
                  order['variant'] = 0;
                }
              }
              if (order && order.discount == 0) {
                if (order.size == 1) {
                  if (order.variations[0].items[order.variant].discount && order.variations[0].items[order.variant].discount != 0) {
                    price = price + (parseFloat(order.variations[0].items[order.variant].discount) * order.quantiy);
                  } else {
                    price = price + (parseFloat(order.variations[0].items[order.variant].price) * order.quantiy);
                  }
                } else {
                  price = price + (parseFloat(order.original_price) * order.quantiy);
                }
              } else {
                if (order.size == 1) {
                  if (order.variations[0].items[order.variant].discount && order.variations[0].items[order.variant].discount != 0) {
                    price = price + (parseFloat(order.variations[0].items[order.variant].discount) * order.quantiy);
                  } else {
                    price = price + (parseFloat(order.variations[0].items[order.variant].price) * order.quantiy);
                  }
                } else {
                  price = price + (parseFloat(order.sell_price) * order.quantiy);
                }
              }
              orderTotal = orderTotal + price;
            });
          });
          data.totalSell = orderTotal;
          console.log('order total ->', orderTotal);
        });
        this.todayChartData = todaysDataChart;
        console.log('todayChartData data chart', todaysDataChart);

        week.forEach(async (element: any) => {
          if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.orders)) {
            element.orders = JSON.parse(element.orders);
            element.orders = element.orders.filter((x: any) => x.store_id == this.storeId);
            if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.status)) {
              const info = JSON.parse(element.status);
              const selected = info.filter((x: any) => x.id == this.storeId);
              if (selected && selected.length) {
                element.orders.forEach((element: any) => {
                  allOrders.push(element);
                });
                const status = selected[0].status;

                if (status == 'delivered') {
                  element.orders.forEach((order: any) => {
                    let price = 0;
                    if (order.variations && order.variations != '' && typeof order.variations == 'string') {
                      console.log('strings', element.id);
                      order.variations = JSON.parse(order.variations);
                      console.log(order['variant']);
                      if (order["variant"] == undefined) {
                        order['variant'] = 0;
                      }
                    }
                    if (order && order.discount == 0) {
                      if (order.size == 1) {
                        if (order.variations[0].items[order.variant].discount && order.variations[0].items[order.variant].discount != 0) {
                          price = price + (parseFloat(order.variations[0].items[order.variant].discount) * order.quantiy);
                        } else {
                          price = price + (parseFloat(order.variations[0].items[order.variant].price) * order.quantiy);
                        }
                      } else {
                        price = price + (parseFloat(order.original_price) * order.quantiy);
                      }
                    } else {
                      if (order.size == 1) {
                        if (order.variations[0].items[order.variant].discount && order.variations[0].items[order.variant].discount != 0) {
                          price = price + (parseFloat(order.variations[0].items[order.variant].discount) * order.quantiy);
                        } else {
                          price = price + (parseFloat(order.variations[0].items[order.variant].price) * order.quantiy);
                        }
                      } else {
                        price = price + (parseFloat(order.sell_price) * order.quantiy);
                      }
                    }
                    weekDeliveredTotal = weekDeliveredTotal + price;
                    weekDeliveredOrder.push(order);
                  });
                }
                if (status == 'rejected' || status == 'cancelled') {
                  element.orders.forEach((order: any) => {
                    let price = 0;
                    if (order.variations && order.variations != '' && typeof order.variations == 'string') {
                      console.log('strings', element.id);
                      order.variations = JSON.parse(order.variations);
                      console.log(order['variant']);
                      if (order["variant"] == undefined) {
                        order['variant'] = 0;
                      }
                    }
                    if (order && order.discount == 0) {
                      if (order.size == 1) {
                        if (order.variations[0].items[order.variant].discount && order.variations[0].items[order.variant].discount != 0) {
                          price = price + (parseFloat(order.variations[0].items[order.variant].discount) * order.quantiy);
                        } else {
                          price = price + (parseFloat(order.variations[0].items[order.variant].price) * order.quantiy);
                        }
                      } else {
                        price = price + (parseFloat(order.original_price) * order.quantiy);
                      }
                    } else {
                      if (order.size == 1) {
                        if (order.variations[0].items[order.variant].discount && order.variations[0].items[order.variant].discount != 0) {
                          price = price + (parseFloat(order.variations[0].items[order.variant].discount) * order.quantiy);
                        } else {
                          price = price + (parseFloat(order.variations[0].items[order.variant].price) * order.quantiy);
                        }
                      } else {
                        price = price + (parseFloat(order.sell_price) * order.quantiy);
                      }
                    }
                    weekRejectedTotal = weekRejectedTotal + price;
                    weekRejectedOrder.push(order);
                  });
                }
              }
            }
          }
        });
        const weeksDateChart = [...new Set(week.map((item: any) => moment(item.date_time).format('DD MMM')))];
        let weeksDataChart: any[] = [];
        weeksDateChart.forEach(dt => {
          const item = {
            date: dt,
            sells: week.filter((x: any) => moment(x.date_time).format('DD MMM') == dt),
            totalSell: 0
          }
          weeksDataChart.push(item)
        });
        weeksDataChart.forEach(data => {
          let orderTotal = 0;
          data.sells.forEach((element: any) => {
            element.orders.forEach((order: any) => {
              let price = 0;
              if (order.variations && order.variations != '' && typeof order.variations == 'string') {
                console.log('strings', element.id);
                order.variations = JSON.parse(order.variations);
                console.log(order['variant']);
                if (order["variant"] == undefined) {
                  order['variant'] = 0;
                }
              }
              if (order && order.discount == 0) {
                if (order.size == 1) {
                  if (order.variations[0].items[order.variant].discount && order.variations[0].items[order.variant].discount != 0) {
                    price = price + (parseFloat(order.variations[0].items[order.variant].discount) * order.quantiy);
                  } else {
                    price = price + (parseFloat(order.variations[0].items[order.variant].price) * order.quantiy);
                  }
                } else {
                  price = price + (parseFloat(order.original_price) * order.quantiy);
                }
              } else {
                if (order.size == 1) {
                  if (order.variations[0].items[order.variant].discount && order.variations[0].items[order.variant].discount != 0) {
                    price = price + (parseFloat(order.variations[0].items[order.variant].discount) * order.quantiy);
                  } else {
                    price = price + (parseFloat(order.variations[0].items[order.variant].price) * order.quantiy);
                  }
                } else {
                  price = price + (parseFloat(order.sell_price) * order.quantiy);
                }
              }
              orderTotal = orderTotal + price;
            });
          });
          data.totalSell = orderTotal;
          console.log('order total ->', orderTotal);
        });

        this.weeksChartData = weeksDataChart;
        console.log('weeks data chart', weeksDataChart);
        month.forEach(async (element: any) => {
          if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.orders)) {
            element.orders = JSON.parse(element.orders);

            element.orders = element.orders.filter((x: any) => x.store_id == this.storeId);

            if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.status)) {
              const info = JSON.parse(element.status);
              const selected = info.filter((x: any) => x.id == this.storeId);
              if (selected && selected.length) {
                element.orders.forEach((element: any) => {
                  allOrders.push(element);
                });
                const status = selected[0].status;

                if (status == 'delivered') {
                  element.orders.forEach((order: any) => {
                    let price = 0;
                    if (order.variations && order.variations != '' && typeof order.variations == 'string') {
                      console.log('strings', element.id);
                      order.variations = JSON.parse(order.variations);
                      console.log(order['variant']);
                      if (order["variant"] == undefined) {
                        order['variant'] = 0;
                      }
                    }
                    if (order && order.discount == 0) {
                      if (order.size == 1) {
                        if (order.variations[0].items[order.variant].discount && order.variations[0].items[order.variant].discount != 0) {
                          price = price + (parseFloat(order.variations[0].items[order.variant].discount) * order.quantiy);
                        } else {
                          price = price + (parseFloat(order.variations[0].items[order.variant].price) * order.quantiy);
                        }
                      } else {
                        price = price + (parseFloat(order.original_price) * order.quantiy);
                      }
                    } else {
                      if (order.size == 1) {
                        if (order.variations[0].items[order.variant].discount && order.variations[0].items[order.variant].discount != 0) {
                          price = price + (parseFloat(order.variations[0].items[order.variant].discount) * order.quantiy);
                        } else {
                          price = price + (parseFloat(order.variations[0].items[order.variant].price) * order.quantiy);
                        }
                      } else {
                        price = price + (parseFloat(order.sell_price) * order.quantiy);
                      }
                    }
                    monthDeliveredTotal = monthDeliveredTotal + price;
                    monthDeliveredOrder.push(order);
                  });
                }
                if (status == 'rejected' || status == 'cancelled') {
                  element.orders.forEach((order: any) => {
                    let price = 0;
                    if (order.variations && order.variations != '' && typeof order.variations == 'string') {
                      console.log('strings', element.id);
                      order.variations = JSON.parse(order.variations);
                      console.log(order['variant']);
                      if (order["variant"] == undefined) {
                        order['variant'] = 0;
                      }
                    }
                    if (order && order.discount == 0) {
                      if (order.size == 1) {
                        if (order.variations[0].items[order.variant].discount && order.variations[0].items[order.variant].discount != 0) {
                          price = price + (parseFloat(order.variations[0].items[order.variant].discount) * order.quantiy);
                        } else {
                          price = price + (parseFloat(order.variations[0].items[order.variant].price) * order.quantiy);
                        }
                      } else {
                        price = price + (parseFloat(order.original_price) * order.quantiy);
                      }
                    } else {
                      if (order.size == 1) {
                        if (order.variations[0].items[order.variant].discount && order.variations[0].items[order.variant].discount != 0) {
                          price = price + (parseFloat(order.variations[0].items[order.variant].discount) * order.quantiy);
                        } else {
                          price = price + (parseFloat(order.variations[0].items[order.variant].price) * order.quantiy);
                        }
                      } else {
                        price = price + (parseFloat(order.sell_price) * order.quantiy);
                      }
                    }
                    monthRejectedTotal = monthRejectedTotal + price;
                    monthRejectOrder.push(order);
                  });
                }
              }
            }
          }
        });
        const monthsDateChart = [...new Set(month.map((item: any) => moment(item.date_time).format('DD MMM')))];
        let monthsDataChart: any[] = [];
        monthsDateChart.forEach(dt => {
          const item = {
            date: dt,
            sells: month.filter((x: any) => moment(x.date_time).format('DD MMM') == dt),
            totalSell: 0
          }
          monthsDataChart.push(item)
        });
        monthsDataChart.forEach(data => {
          let orderTotal = 0;
          data.sells.forEach((element: any) => {
            element.orders.forEach((order: any) => {
              let price = 0;
              if (order.variations && order.variations != '' && typeof order.variations == 'string') {
                console.log('strings', element.id);
                order.variations = JSON.parse(order.variations);
                console.log(order['variant']);
                if (order["variant"] == undefined) {
                  order['variant'] = 0;
                }
              }
              if (order && order.discount == 0) {
                if (order.size == 1) {
                  if (order.variations[0].items[order.variant].discount && order.variations[0].items[order.variant].discount != 0) {
                    price = price + (parseFloat(order.variations[0].items[order.variant].discount) * order.quantiy);
                  } else {
                    price = price + (parseFloat(order.variations[0].items[order.variant].price) * order.quantiy);
                  }
                } else {
                  price = price + (parseFloat(order.original_price) * order.quantiy);
                }
              } else {
                if (order.size == 1) {
                  if (order.variations[0].items[order.variant].discount && order.variations[0].items[order.variant].discount != 0) {
                    price = price + (parseFloat(order.variations[0].items[order.variant].discount) * order.quantiy);
                  } else {
                    price = price + (parseFloat(order.variations[0].items[order.variant].price) * order.quantiy);
                  }
                } else {
                  price = price + (parseFloat(order.sell_price) * order.quantiy);
                }
              }
              orderTotal = orderTotal + price;
            });
          });
          data.totalSell = orderTotal;
          console.log('order total ->', orderTotal);
        });
        this.monthsChartData = monthsDataChart;
        console.log('months data chart', monthsDataChart);

        this.todayStates.total = todayDeliveredTotal;
        this.todayStates.totalSold = todayDeliveredOrder.length;

        this.todayStatesRejected.total = todayRejectedTotal;
        this.todayStatesRejected.totalSold = todayRejectOrder.length;

        this.weeekStates.total = weekDeliveredTotal;
        this.weeekStates.totalSold = weekDeliveredOrder.length;

        this.weeekStatesRejected.total = weekRejectedTotal;
        this.weeekStatesRejected.totalSold = weekRejectedOrder.length;

        this.monthStats.total = monthDeliveredTotal;
        this.monthStats.totalSold = monthDeliveredOrder.length;

        this.monthStatsRejected.total = monthRejectedTotal;
        this.monthStatsRejected.totalSold = monthRejectOrder.length;

        console.log('today delivered', todayDeliveredOrder, todayDeliveredTotal);
        console.log('today rejected', todayRejectOrder, todayRejectedTotal);

        console.log('week delivered', weekDeliveredOrder, weekDeliveredTotal);
        console.log('week rejected', weekRejectedOrder, weekRejectedTotal);

        console.log('month delivered', monthDeliveredOrder, monthDeliveredTotal);
        console.log('month rejected', monthRejectOrder, monthRejectedTotal);



        console.log('all Order', allOrders);
        const uniqueId = [...new Set(allOrders.map(item => item.id))];
        console.log(uniqueId);
        let topProducts: any[] = [];
        uniqueId.forEach(element => {
          const info = allOrders.filter(x => x.id == element);
          if (info && info.length > 0) {
            if (topProducts.length < 10) {
              const item = {
                id: element,
                items: info[0],
                counts: info.length
              };
              topProducts.push(item);
            }
          }
        });
        this.topProducts = topProducts.sort(({ counts: a }, { counts: b }) => b - a);
        console.log(topProducts);
        console.log(this.topProducts);
        this.openChart();
      }
    }, error => {
      console.log(error);
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.util.apiErrorHandler(error);
    });
  }

  async openChart() {
    console.log('parse chart');
    this.topProducts.forEach((element: any) => {
      // this.doughnutChartLabels.push(element.items.name);
      // this.doughnutChartData[0].data.push(element.counts);
      this.doughnutChartData.labels.push(element.items.name);
      this.doughnutChartData.datasets[0].data.push(element.counts);
    });

    this.monthsChartData.forEach(element => {
      // this.barChartLabelsMonths.push(element.date);
      // this.barChartDataMonths[0].data.push(element.totalSell);
      this.barChartDataMonths.labels.push(element.date);
      this.barChartDataMonths.datasets[0].data.push(element.totalSell);
    });

    this.weeksChartData.forEach(element => {
      // this.barChartLabelsWeeks.push(element.date);
      // this.barChartDataWeeks[0].data.push(element.totalSell);
      this.barChartDataWeeks.labels.push(element.date);
      this.barChartDataWeeks.datasets[0].data.push(element.totalSell);
    });

    this.todayChartData.forEach(element => {
      // this.barChartLabelsToday.push(element.date);
      // this.barChartDataToday[0].data.push(element.totalSell);
      this.barChartDataToday.labels.push(element.date);
      this.barChartDataToday.datasets[0].data.push(element.totalSell);
    });

    this.monthLabel = this.monthStats.label;

    console.log(this);
  }

  getReviews() {
    console.log('fetching reviews');
    const param = {
      id: this.storeId,
    };
    this.dummyReviews = Array(10);
    this.api.post_private('v1/ratings/getWithStoreIdAdmin', param).then((data: any) => {
      this.dummyReviews = [];
      console.log(data);
      if (data && data.status && data.status == 200 && data.data) {
        this.reviews = data.data;
      }
    }, error => {
      console.log(error);
      this.dummyReviews = [];
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.dummyReviews = [];
      this.util.apiErrorHandler(error);
    });
  }

  getDate(date: any) {
    return moment(date).format('lll');
  }

  getProducts() {
    console.log('fetching products');
    const param = {
      id: this.storeId,
      limit: 5000,
    };
    this.api.post_private('v1/products/getByStoreIdStoreAllAdmin', param).then((data: any) => {
      console.log(data);
      this.dummyLoadProducts = [];
      if (data && data.status == 200) {
        this.products = data.data;
        this.dummyProducts = data.data;
        this.products = orderBy(this.products, ['id'], ['desc']);
      }
    }, error => {
      console.log(error);
      this.util.apiErrorHandler(error);
      this.dummyLoadProducts = [];
    }).catch(error => {
      console.log(error);
      this.util.apiErrorHandler(error);
      this.dummyLoadProducts = [];
    });
  }

  goToOrder(item: any) {
    const param: NavigationExtras = {
      queryParams: {
        id: item.id
      }
    }
    this.router.navigate(['order-details'], param);
  }


  onSearchChange(event: any) {
    console.log(event);
    this.products = this.dummyProducts.filter((ele: any) => {
      return ele.name.toLowerCase().includes(event.toLowerCase());
    });
  }

  sortByName() {
    this.products = orderBy(this.products, ['name'], ['asc']);
  }

  sortByRating() {
    this.products = orderBy(this.products, ['rating'], ['desc']);
  }

  updateStock(item: any) {
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
          in_stoke: item.in_stoke == 0 ? 1 : 0
        };
        console.log("========", body);
        this.util.show();
        this.api.post_private('v1/products/updateProducts', body).then((data: any) => {
          this.util.hide();
          console.log("+++++++++++++++", data);
          if (data && data.status && data.status == 200 && data.success) {
            this.util.success(this.util.translate('Status Updated !'));
            this.getProducts();
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

  updateStatus(item: any) {
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
          status: item.status == 0 ? 1 : 0
        };
        console.log("========", body);
        this.util.show();
        this.api.post_private('v1/products/updateStatus', body).then((data: any) => {
          this.util.hide();
          console.log("+++++++++++++++", data);
          if (data && data.status && data.status == 200 && data.success) {
            this.util.success(this.util.translate('Status Updated !'));
            this.getProducts();
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
}
