import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { RealtimeService } from 'src/app/services/realtime.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-print-requests',
  templateUrl: './print-requests.component.html',
  styleUrls: ['./print-requests.component.scss']
})
export class PrintRequestsComponent implements OnInit, OnDestroy {
  @ViewChild('requestModal') public requestModal: ModalDirective;

  dummy: any[] = [];
  requests: any[] = [];
  filteredRequests: any[] = [];
  page = 1;
  searchTerm = '';
  selectedRequest: any;
  selectedStatus = 'pending';
  adminNote = '';
  saving = false;
  private subscriptions = new Subscription();

  readonly statuses = [
    'pending',
    'accepted',
    'rejected',
    'in_review',
    'printing',
    'ready',
    'completed',
    'cancelled',
  ];

  constructor(
    public api: ApiService,
    public util: UtilService,
    private realtime: RealtimeService,
  ) { }

  ngOnInit(): void {
    this.getRequests();
    this.subscriptions.add(this.realtime.printOrder$.subscribe((request) => this.upsertRequest(request)));
    this.subscriptions.add(this.realtime.printOrderUpdated$.subscribe((request) => this.upsertRequest(request)));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getRequests() {
    this.dummy = Array(8);
    this.api.get_private('v1/print-requests/getAll').then((data: any) => {
      this.dummy = [];
      this.requests = data && data.status === 200 && data.data ? data.data : [];
      this.applySearch();
    }, (error) => {
      this.dummy = [];
      this.util.apiErrorHandler(error);
    });
  }

  private upsertRequest(request: any) {
    if (!request?.id) {
      return;
    }

    const index = this.requests.findIndex((item: any) => item.id === request.id);
    if (index === -1) {
      this.requests.unshift(request);
    } else {
      this.requests[index] = request;
    }
    this.applySearch();
  }

  applySearch() {
    const search = this.searchTerm.trim().toLowerCase();
    if (!search) {
      this.filteredRequests = this.requests;
      return;
    }

    this.filteredRequests = this.requests.filter((request) => {
      const customer = this.getCustomerName(request).toLowerCase();
      const email = request.user?.email?.toLowerCase() || '';
      return String(request.id).includes(search) || customer.includes(search) || email.includes(search);
    });
    this.page = 1;
  }

  openItem(request: any) {
    this.selectedRequest = request;
    this.selectedStatus = request.status;
    this.adminNote = request.admin_note || '';
    this.requestModal.show();
  }

  saveStatus() {
    if (!this.selectedRequest || this.saving) {
      return;
    }

    this.saving = true;
    this.util.show();
    this.api.post_private('v1/print-requests/updateStatus', {
      id: this.selectedRequest.id,
      status: this.selectedStatus,
      admin_note: this.adminNote,
    }).then((data: any) => {
      this.saving = false;
      this.util.hide();
      if (data && data.status === 200) {
        this.requestModal.hide();
        this.util.success(this.util.translate('Print request updated'));
        this.getRequests();
      }
    }, (error) => {
      this.saving = false;
      this.util.hide();
      this.util.apiErrorHandler(error);
    });
  }

  openDocument(document: any) {
    const documentWindow = window.open('', '_blank');
    this.api.post_private('v1/print-requests/document/access', { document_id: document.id }).then((data: any) => {
      const url = data?.data?.url;
      if (!url) {
        documentWindow?.close();
        this.util.error(this.util.translate('Unable to open the document'));
        return;
      }

      if (documentWindow) {
        documentWindow.location.href = url;
      } else {
        window.open(url, '_blank');
      }
    }, (error) => {
      documentWindow?.close();
      this.util.apiErrorHandler(error);
    });
  }

  getCustomerName(request: any) {
    const user = request && request.user;
    return user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : this.util.translate('Unknown user');
  }

  statusLabel(status: string) {
    const labels: any = {
      awaiting_payment: 'Waiting for payment',
      pending: 'Submitted',
      accepted: 'Accepted',
      rejected: 'Rejected',
      in_review: 'In review',
      printing: 'Printing',
      ready: 'Ready for collection',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return this.util.translate(labels[status] || status);
  }

  paymentStatusLabel(status: string) {
    const labels: any = {
      pending: 'Payment pending',
      paid: 'Paid',
      failed: 'Payment failed',
    };
    return this.util.translate(labels[status] || status || 'Paid');
  }

  isPaid(request: any) {
    return (request?.payment_status || 'paid') === 'paid';
  }

  formatAmount(amount: any) {
    return Number(amount || 0).toFixed(2);
  }

  statusHistory(request: any) {
    if (Array.isArray(request?.status_history)) {
      return request.status_history;
    }
    try {
      return JSON.parse(request?.status_history || '[]');
    } catch (error) {
      return [];
    }
  }

  deliveryAddress(request: any) {
    const address = request?.delivery_address;
    if (!address) {
      return null;
    }
    if (typeof address === 'object') {
      return address;
    }
    try {
      return JSON.parse(address);
    } catch (error) {
      return null;
    }
  }

  deliveryAddressLine(address: any) {
    return [address?.house, address?.landmark, address?.address]
      .filter((part) => !!part)
      .join(', ');
  }

  formatFileSize(bytes: number) {
    if (!bytes) {
      return '0 KB';
    }
    if (bytes < 1024 * 1024) {
      return `${Math.ceil(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
