import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import Pusher from 'pusher-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RealtimeService {
  readonly activeUserCount$ = new BehaviorSubject<number>(0);
  readonly printOrder$ = new Subject<any>();
  readonly printOrderUpdated$ = new Subject<any>();
  readonly expressOrder$ = new Subject<any>();

  private pusher: Pusher | null = null;
  private activeUserIds = new Set<string>();
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionallyDisconnecting = false;

  connect() {
    const token = localStorage.getItem('token');
    if (this.pusher || !token || !environment.realtime?.key) {
      return;
    }

    const realtime: any = environment.realtime;
    const options: any = {
      cluster: realtime.cluster,
      forceTLS: realtime.forceTLS,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: environment.realtime.authEndpoint,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    };

    // A host is supplied only for an explicitly self-hosted Pusher-compatible
    // server. Pusher Cloud resolves its own regional WebSocket host from the
    // app cluster.
    if (realtime.host) {
      options.wsHost = realtime.host;
      options.wsPort = realtime.port;
      options.wssPort = realtime.port;
    }

    // Keep the Pusher library diagnostics available during local development.
    // They make an auth/connection failure visible in the browser console while
    // remaining disabled in the production bundle.
    if (!environment.production) {
      Pusher.logToConsole = true;
    }

    this.pusher = new Pusher(environment.realtime.key, options);

    this.pusher.connection.bind('error', (error: any) => {
      console.error('Pusher connection error', error);
      this.scheduleReconnect();
    });
    this.pusher.connection.bind('disconnected', () => {
      this.activeUserIds.clear();
      this.publishActiveUserCount();
      if (!this.intentionallyDisconnecting) {
        this.scheduleReconnect();
      }
    });

    const printOrders = this.pusher.subscribe('private-admin-print-orders');
    printOrders.bind('print-order.submitted', (event: any) => {
      if (event?.request) {
        this.printOrder$.next(event.request);
      }
    });
    printOrders.bind('pusher:subscription_error', (error: any) => {
      console.error('Pusher print-order subscription error', error);
      this.scheduleReconnect();
    });

    const expressOrders = this.pusher.subscribe('private-admin-express-orders');
    expressOrders.bind('express-order.created', (event: any) => {
      if (event?.order) {
        this.expressOrder$.next(event.order);
      }
    });
    expressOrders.bind('pusher:subscription_error', (error: any) => {
      console.error('Pusher express-order subscription error', error);
      this.scheduleReconnect();
    });

    const activeUsers = this.pusher.subscribe('presence-active-users');
    activeUsers.bind('pusher:subscription_succeeded', (members: any) => {
      this.activeUserIds.clear();
      members?.each((member: any) => this.addActiveUser(member));
      this.publishActiveUserCount();
    });
    activeUsers.bind('pusher:member_added', (member: any) => {
      this.addActiveUser(member);
      this.publishActiveUserCount();
    });
    activeUsers.bind('pusher:member_removed', (member: any) => {
      this.activeUserIds.delete(String(member?.id));
      this.publishActiveUserCount();
    });
    activeUsers.bind('pusher:subscription_error', (error: any) => {
      console.error('Pusher active-users subscription error', error);
      this.scheduleReconnect();
    });
  }

  disconnect() {
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.intentionallyDisconnecting = true;
    this.pusher?.disconnect();
    this.pusher = null;
    this.intentionallyDisconnecting = false;
    this.activeUserIds.clear();
    this.publishActiveUserCount();
  }

  publishPrintOrderUpdate(request: any) {
    this.printOrderUpdated$.next(request);
  }

  private addActiveUser(member: any) {
    if (member?.info?.type === 'user') {
      this.activeUserIds.add(String(member.id));
    }
  }

  private publishActiveUserCount() {
    this.activeUserCount$.next(this.activeUserIds.size);
  }

  private scheduleReconnect() {
    if (this.retryTimer !== null) {
      return;
    }

    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.intentionallyDisconnecting = true;
      this.pusher?.disconnect();
      this.pusher = null;
      this.intentionallyDisconnecting = false;
      this.connect();
    }, 3000);
  }
}
