/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import {
  AfterViewInit,
  Component,
  HostListener,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { UtilService } from "src/app/services/util.service";
import { INavData } from "@coreui/angular";
import { navItems } from "./_nav";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Subscription } from "rxjs";
import { ApiService } from "src/app/services/api.service";
import { RealtimeService } from "src/app/services/realtime.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./default-layout.component.html",
})
export class DefaultLayoutComponent implements AfterViewInit, OnDestroy {
  @ViewChild("newOrderModal") public newOrderModal: ModalDirective;
  @ViewChild("expressOrderModal") public expressOrderModal: ModalDirective;

  public navItems: INavData[] = [];
  activeUserCount = 0;
  activeNewOrder: any = null;
  notificationSaving = false;
  activeExpressOrder: any = null;
  expressSaving = false;

  private newOrderQueue: any[] = [];
  private expressOrderQueue: any[] = [];
  private subscriptions = new Subscription();
  private expressOrderPoll?: ReturnType<typeof setInterval>;
  private orderAlarm?: HTMLAudioElement;
  private orderAlarmUnlocked = false;

  public perfectScrollbarConfig = {
    suppressScrollX: true,
  };

  constructor(
    public util: UtilService,
    private api: ApiService,
    private realtime: RealtimeService,
    private router: Router,
  ) {
    setTimeout(() => {
      this.util.navItems.forEach((x) => {
        x.name = this.util.translate(x.name);
        x.children?.forEach((sub) => {
          sub.name = this.util.translate(sub.name);
        });
      });
      this.navItems = this.util.navItems;
    }, 2000);
  }

  ngAfterViewInit(): void {
    this.prepareOrderAlarm();
    this.subscriptions.add(
      this.realtime.activeUserCount$.subscribe((count) => {
        this.activeUserCount = count;
      }),
    );
    this.subscriptions.add(
      this.realtime.printOrder$.subscribe((request) => {
        this.queueNewOrder(request);
      }),
    );
    this.subscriptions.add(
      this.realtime.expressOrder$.subscribe((order) => {
        this.queueExpressOrder(order);
      }),
    );
    this.subscriptions.add(
      this.router.events.subscribe(() => this.realtime.connect()),
    );
    this.realtime.connect();
    this.loadPendingExpressOrders();
    // Pusher is the immediate path. This small safety net prevents an open
    // Admin session from missing an Instant order if a private-channel auth
    // request is briefly interrupted.
    this.expressOrderPoll = setInterval(
      () => this.loadPendingExpressOrders(),
      3000,
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.expressOrderPoll) {
      clearInterval(this.expressOrderPoll);
    }
    this.stopOrderAlarm();
    this.realtime.disconnect();
  }

  // Audible media started by a socket event is blocked by modern browsers
  // until the page receives a user interaction. Prime the alarm on the first
  // click/keypress so future incoming orders can play immediately.
  @HostListener("document:pointerdown")
  @HostListener("document:keydown")
  unlockOrderAlarm() {
    if (this.orderAlarmUnlocked || !this.orderAlarm) {
      return;
    }

    this.orderAlarm.muted = true;
    this.orderAlarm
      .play()
      .then(() => {
        this.orderAlarm!.pause();
        this.orderAlarm!.currentTime = 0;
        this.orderAlarm!.muted = false;
        this.orderAlarmUnlocked = true;

        if (this.activeExpressOrder) {
          this.startOrderAlarm();
        }
      })
      .catch((error) => {
        this.orderAlarm!.muted = false;
        console.warn("Order alarm is waiting for an Admin interaction", error);
      });
  }

  dismissNewOrder() {
    if (this.notificationSaving) {
      return;
    }
    this.newOrderModal.hide();
    this.activeNewOrder = null;
    window.setTimeout(() => this.showNextNewOrder());
  }

  respondToNewOrder(status: "accepted" | "rejected") {
    if (!this.activeNewOrder || this.notificationSaving) {
      return;
    }

    this.notificationSaving = true;
    const requestId = this.activeNewOrder.id;
    const adminNote =
      status === "accepted"
        ? this.util.translate("Your print order has been accepted.")
        : this.util.translate("Your print order has been rejected.");

    this.api
      .post_private("v1/print-requests/updateStatus", {
        id: requestId,
        status,
        admin_note: adminNote,
      })
      .then(
        (data: any) => {
          this.notificationSaving = false;
          if (data?.status !== 200) {
            this.util.error(
              this.util.translate("Unable to update the print request"),
            );
            return;
          }

          this.realtime.publishPrintOrderUpdate(data.data);
          this.util.success(
            this.util.translate(
              status === "accepted"
                ? "Print order accepted"
                : "Print order rejected",
            ),
          );
          this.dismissNewOrder();
        },
        (error) => {
          this.notificationSaving = false;
          this.util.apiErrorHandler(error);
        },
      );
  }

  formatAmount(amount: any) {
    return Number(amount || 0).toFixed(2);
  }

  dismissExpressOrder() {
    if (this.expressSaving) {
      return;
    }
    this.expressOrderModal.hide();
    this.activeExpressOrder = null;
    window.setTimeout(() => this.showNextExpressOrder());
  }

  respondToExpressOrder(status: "accepted" | "rejected") {
    if (!this.activeExpressOrder || this.expressSaving) {
      return;
    }

    this.expressSaving = true;
    this.api
      .post_private("v1/orders/express/respond", {
        id: this.activeExpressOrder.id,
        status,
      })
      .then(
        (data: any) => {
          this.expressSaving = false;
          if (data?.status !== 200) {
            this.util.error(
              data?.message ||
                this.util.translate("Unable to update the express order"),
            );
            return;
          }
          this.util.success(
            this.util.translate(
              status === "accepted"
                ? "Express order accepted"
                : "Express order rejected",
            ),
          );
          this.stopOrderAlarm();
          this.dismissExpressOrder();
        },
        (error) => {
          this.expressSaving = false;
          this.util.apiErrorHandler(error);
        },
      );
  }

  expressItemCount(order: any) {
    try {
      return Array.isArray(order?.orders)
        ? order.orders.length
        : JSON.parse(order?.orders || "[]").length;
    } catch (error) {
      return 0;
    }
  }

  getCustomerName(request: any) {
    const user = request?.user;
    return user
      ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email
      : this.util.translate("Unknown user");
  }

  private queueNewOrder(request: any) {
    if (
      !request?.id ||
      request.status !== "pending" ||
      request.payment_status !== "paid" ||
      this.activeNewOrder?.id === request.id ||
      this.newOrderQueue.some((queued) => queued.id === request.id)
    ) {
      return;
    }

    this.newOrderQueue.push(request);
    this.showNextNewOrder();
  }

  private showNextNewOrder() {
    if (
      this.activeNewOrder ||
      !this.newOrderQueue.length ||
      !this.newOrderModal
    ) {
      return;
    }

    this.activeNewOrder = this.newOrderQueue.shift();
    this.newOrderModal.show();
  }

  private loadPendingExpressOrders() {
    this.api.get_private("v1/orders/express/pending").then(
      (data: any) => {
        if (data?.status === 200 && Array.isArray(data?.data)) {
          data.data
            .reverse()
            .forEach((order: any) => this.queueExpressOrder(order));
        }
      },
      (error) => {
        console.log("Unable to restore pending express orders", error);
      },
    );
  }

  private queueExpressOrder(order: any) {
    if (
      !order?.id ||
      order.delivery_type !== "instant" ||
      order.accepted_at ||
      order.rejected_at ||
      this.activeExpressOrder?.id === order.id ||
      this.expressOrderQueue.some((queued) => queued.id === order.id)
    ) {
      return;
    }

    this.expressOrderQueue.push(order);
    this.showNextExpressOrder();
  }

  private showNextExpressOrder() {
    if (
      this.activeExpressOrder ||
      !this.expressOrderQueue.length ||
      !this.expressOrderModal
    ) {
      return;
    }

    this.activeExpressOrder = this.expressOrderQueue.shift();
    this.expressOrderModal.show();
    this.startOrderAlarm();
  }

  private prepareOrderAlarm() {
    this.orderAlarm = new Audio("assets/sounds/order-alarm.wav");
    this.orderAlarm.loop = true;
    this.orderAlarm.preload = "auto";
  }

  private startOrderAlarm() {
    if (!this.orderAlarm) {
      this.prepareOrderAlarm();
    }

    if (!this.orderAlarmUnlocked) {
      return;
    }

    this.orderAlarm!.currentTime = 0;
    this.orderAlarm!.play().catch((error) => {
      console.warn("Order alarm could not start", error);
    });
  }

  private stopOrderAlarm() {
    if (!this.orderAlarm) {
      return;
    }

    this.orderAlarm.pause();
    this.orderAlarm.currentTime = 0;
  }
}
