/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  stores: any[] = [];
  storeId: any;
  storecommission: any;
  from: any;
  to: any;
  allOrders: any[] = [];
  storeOrder: any[] = [];
  totalAmount: any = 0;
  commisionAmount: any = 0;
  toPay: any = 0;
  apiCalled: boolean;
  storename: any;

  totalAmountsFromOrder: any = 0;
  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    this.getStores();
  }

  getStores() {
    this.util.show();
    this.api.get_private('v1/store/getStores').then((data: any) => {
      console.log(data);
      this.util.hide();
      if (data && data.status && data.status == 200 && data.data && data.data.length) {
        this.stores = data.data;

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

  ngOnInit(): void {
  }

  getStats() {
    console.log('from', this.from);
    console.log('to', this.to);
    console.log('storeid', this.storeId);
    if (this.from && this.to && this.storeId) {
      const store = this.stores.filter(x => x.uid == this.storeId);
      if (store && store.length) {
        this.storename = store[0].name;
      }
      console.log('ok');
      const param = {
        id: this.storeId,
        from: moment(this.from, 'YYYY-MM-DD HH:mm A').utc(false).format('YYYY-MM-DD HH:mm'),
        to: moment(this.to, 'YYYY-MM-DD HH:mm A').utc(false).format('YYYY-MM-DD HH:mm'),
      };
      console.log(param);
      this.util.show();
      this.apiCalled = false;
      this.storeOrder = [];
      this.api.post_private('v1/orders/getStatsOfStore', param).then((data: any) => {
        this.apiCalled = true;
        this.util.hide();
        console.log(data);
        if (data && data.status == 200 && data.data.length) {
          this.storecommission = data.commission.commission;
          console.log('commustion', this.storecommission);
          let total = 0;
          data.data.forEach(async (element: any) => {
            if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.orders)) {
              element.orders = JSON.parse(element.orders);
              element.date_time = moment(element.date_time).format('dddd, MMMM Do YYYY');
              element.orders = await element.orders.filter((x: any) => x.store_id == this.storeId);
              console.log(element.discount);
              if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.status)) {
                const info = JSON.parse(element.status);

                const selected = await info.filter((x: any) => x.id == this.storeId);
                if (selected && selected.length) {
                  if (selected[0].status == 'delivered') {
                    await element.orders.forEach((calc: any) => {
                      if (calc.variations && calc.variations != '' && typeof calc.variations == 'string') {
                        calc.variations = JSON.parse(calc.variations);
                        console.log(calc['variant']);
                        if (calc["variant"] == undefined) {
                          calc['variant'] = 0;
                        }
                      }
                      if (calc && calc.discount == 0) {
                        if (calc.size == 1 || calc.size == 1) {
                          if (calc.variations[0].calc[calc.variant].discount && calc.variations[0].items[calc.variant].discount != 0) {
                            total = total + (parseFloat(calc.variations[0].items[calc.variant].discount) * calc.quantiy);
                          } else {
                            total = total + (parseFloat(calc.variations[0].items[calc.variant].price) * calc.quantiy);
                          }
                        } else {
                          total = total + (parseFloat(calc.original_price) * calc.quantiy);
                        }
                      } else {
                        if (calc.size == 1 || calc.size == 1) {
                          if (calc.variations[0].items[calc.variant].discount && calc.variations[0].items[calc.variant].discount != 0) {
                            total = total + (parseFloat(calc.variations[0].items[calc.variant].discount) * calc.quantiy);
                          } else {
                            total = total + (parseFloat(calc.variations[0].items[calc.variant].price) * calc.quantiy);
                          }
                        } else {
                          total = total + (parseFloat(calc.sell_price) * calc.quantiy);
                        }
                      }
                    });
                    this.storeOrder.push(element);
                  }
                }
              }
            }
          });

          setTimeout(() => {
            function percentage(num: any, per: any) {
              return (num / 100) * per;
            }
            console.log(this.storeOrder);
            total = Number(total);
            console.log(total, this.storecommission);
            const totalPrice = percentage(total, parseFloat(this.storecommission));
            console.log('commistion===>>>>>', totalPrice.toFixed(2));
            this.commisionAmount = totalPrice.toFixed(2);
            this.totalAmount = total;
            this.toPay = this.commisionAmount;
          }, 1000);

        }
      }, error => {
        this.util.hide();
        console.log(error);
        this.apiCalled = true;
        this.util.error(this.util.translate('Something went wrong'));
      }).catch((error) => {
        this.util.hide();
        console.log(error);
        this.apiCalled = true;
        this.util.error(this.util.translate('Something went wrong'));
      });
    } else {
      console.log('not valid');
      this.util.error(this.util.translate('All Fields are required'));
      return false;
    }
  }

  getCommisions(total: any) {
    return ((parseFloat(total) * this.storecommission) / 100).toFixed(2);
  }

  donwloadPDF() {

  }
  today() {
    return moment().format('ll');
  }
  getDate(date: any) {
    return moment(date).format('ll');
  }
  getName() {
    return this.storeOrder[0].name + '_' + moment(this.from).format('DDMMYYYY') + '_' + moment(this.to).format('DDMMYYYY');
  }
}
