/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {
  @ViewChild('scrollMe', { static: false }) private myScrollContainer: ElementRef;
  @ViewChildren('messages') messagesList: QueryList<any>;
  users: any[] = [];
  dummy: any[] = [];
  dummyList = Array(5);
  id: any;
  message: any;
  messages: any[] = [];
  selectedId: any;
  name: any;
  avtar: any;
  type: any;
  interval: any;
  uid: any;
  roomId: any = '';
  @HostListener('window:beforeunload')
  canDeactivate(): any {
    console.log('ok');
  };
  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    this.uid = parseInt(localStorage.getItem('uid') ?? '');
    this.getList();
    this.util.successEject().subscribe(() => {
      clearInterval(this.interval);
    })
  }

  getList() {
    this.users = [];
    this.dummy = [];
    this.getChatList();
  }


  getChatList() {
    this.dummyList = Array(5);
    this.api.post_private('v1/chats/getChatListBUid', { id: this.uid }).then((data: any) => {
      console.log(data);
      this.dummyList = [];
      if (data && data.status && data.data && data.data.length) {
        this.users = data.data;
      }
    }, error => {
      console.log(error);
      this.dummyList = [];
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.dummyList = [];
      this.util.apiErrorHandler(error);
    });
  }

  ngOnInit(): void {
  }

  search(str: any) {
    console.log(str);
  }

  getChatRooms() {
    const param = {
      uid: this.uid,
      participants: this.id
    };
    this.api.post_private('v1/chats/getChatRooms', param).then((data: any) => {
      console.log(data);
      if (data && data.status && data.status == 200) {
        if (data && data.data && data.data.id) {
          this.roomId = data.data.id;
        } else if (data && data.data2 && data.data2.id) {
          this.roomId = data.data2.id;
        }
        this.getMessageList();
        this.interval = setInterval(() => {
          console.log('calling in interval');
          this.getMessageList();
        }, 12000);
      } else {
        this.createChatRooms();
      }
    }, error => {
      console.log('error', error);
      this.createChatRooms();
    }).catch(error => {
      this.createChatRooms();
      console.log('error', error);
    });
  }

  createChatRooms() {
    const param = {
      uid: this.uid,
      participants: this.id,
      status: 1
    };
    this.api.post_private('v1/chats/createChatRooms', param).then((data: any) => {
      console.log(data);

      if (data && data.status && data.status == 200 && data.data) {
        this.roomId = data.data.id;
        this.getMessageList();
        this.interval = setInterval(() => {
          console.log('calling in interval');
          this.getMessageList();
        }, 12000);
      }
    }, error => {
      console.log('error', error);
    }).catch(error => {
      console.log('error', error);
    });
  }


  chatUser(id: any, type: any, userName: any) {
    console.log(id, type, userName);
    this.id = id;
    this.name = userName;
    this.getChatRooms();
  }

  getMessageList() {
    this.api.post_private('v1/chats/getById', { room_id: this.roomId }).then((data: any) => {
      console.log(data);
      if (data && data.status && data.status == 200 && data.data.length) {
        this.messages = data.data;
      }
    }, error => {
      console.log(error);
    }).catch(error => {
      console.log(error);
    });
  }

  send() {
    console.log(this.message);
    if (!this.message || this.message == '') {
      return false;
    }
    const msg = this.message;
    this.message = '';
    const param = {
      room_id: this.roomId,
      uid: this.uid,
      from_id: this.uid,
      message: msg,
      message_type: 0,
      status: 1,
    };

    this.api.post_private('v1/chats/sendMessage', param).then((data: any) => {
      console.log(data);
      if (data && data.status == 200) {
        this.getMessageList();
      }
    }, error => {
      console.log(error);
    });
  }
}
