/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { Component, OnInit, ViewChild } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { ApiService } from "src/app/services/api.service";
import { UtilService } from "src/app/services/util.service";

@Component({
  selector: "app-app-settings",
  templateUrl: "./app-settings.component.html",
  styleUrls: ["./app-settings.component.scss"],
})
export class AppSettingsComponent implements OnInit {
  @ViewChild("largeModal") public largeModal: ModalDirective;
  appDirection: any = "ltr";
  logo: any = "";
  currencySymbol: any = "";
  currencySide: any = "left";
  currencyCode: any = "";
  delivery: any = 0;
  sms_name: any = "0";
  user_login: any = 0; // 0 = email & password || 1 = phone & password || 2 = phone & OTP
  driver_login: any = 0;
  store_login: any = 0;
  user_web_login: any = 0;
  reset_password: any = 0; //  email otp || 1 = phone otp

  id: any;
  haveData: boolean = false;
  app_color: any = "#000000";
  app_status: any = 1;
  country_modal: any[] = [];
  app_status_message: any = "";
  default_country_code: any;

  twilloCreds = {
    sid: "",
    token: "",
    from: "",
  };

  msgCreds = {
    key: "",
    sender: "",
  };

  countries: any[] = [];
  dummy: any[] = [];
  dummyLoad: any[] = [];
  fcm_token: any = "##";
  selected: any[] = [];
  findType: any = 0;
  makeOrders: any = 0;
  driver_assign: any = 0;

  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {
    singleSelection: false,
    idField: "id",
    textField: "name",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    allowSearchFilter: true,
  };

  user_verify_with: any = 0;
  search_radius: any = 10;
  login_style: any = 1;
  register_style: any = 1;
  home_page_style_app: any = 1;

  default_delivery_zip: any = "";
  default_city_id: any = "";
  cities: any[] = [];
  social: any = {
    fb: "#",
    insta: "#",
    twitter: "#",
    linkedIn: "#",
    googlePlay: "#",
    appleStore: "#",
  };
  constructor(public util: UtilService, public api: ApiService) {
    this.getData();
  }

  ngOnInit(): void {}

  getData() {
    this.util.show();
    this.api
      .get_private("v1/setttings/getSettingsForOwner")
      .then(
        (data: any) => {
          this.util.hide();
          console.log(data);
          if (data && data.status == 200 && data.data && data.data) {
            this.haveData = true;
            this.id = data.data.id;
            const info = data.data;
            console.log(info);
            this.appDirection = info.appDirection;
            this.currencySymbol = info.currencySymbol;
            this.currencySide = info.currencySide;
            this.currencyCode = info.currencyCode;
            this.delivery = info.delivery;
            this.findType = info.findType;
            this.makeOrders = info.makeOrders;
            this.reset_password = info.reset_pwd;
            this.store_login = info.store_login;
            this.driver_login = info.driver_login;
            this.user_web_login = info.web_login;
            this.driver_assign = info.driver_assign;
            this.logo = info.logo;
            this.sms_name = info.sms_name;
            this.user_login = info.user_login;
            this.app_status = info.app_status;
            this.app_color = info.app_color;
            this.app_status_message = info.app_status_message;
            this.fcm_token = info.fcm_token;
            this.search_radius = info.search_radius;
            this.user_verify_with = info.user_verify_with;
            this.login_style = info.login_style;
            this.register_style = info.register_style;
            this.home_page_style_app = info.home_page_style_app;
            this.default_delivery_zip = info.default_delivery_zip;
            this.default_city_id = info.default_city_id;

            if (
              ((x) => {
                try {
                  JSON.parse(x);
                  return true;
                } catch (e) {
                  return false;
                }
              })(info.country_modal)
            ) {
              this.country_modal = JSON.parse(info.country_modal);
            }
            this.default_country_code = info.default_country_code;
            if (
              ((x) => {
                try {
                  JSON.parse(x);
                  return true;
                } catch (e) {
                  return false;
                }
              })(info.sms_creds)
            ) {
              const creds = JSON.parse(info.sms_creds);
              console.log("creds=>", creds);
              this.twilloCreds = creds.twilloCreds;
              this.msgCreds = creds.msg;
            }

            if (
              ((x) => {
                try {
                  JSON.parse(x);
                  return true;
                } catch (e) {
                  return false;
                }
              })(info.social)
            ) {
              const social = JSON.parse(info.social);
              this.social = social;
              console.log(this.social);
            }

            this.selectedItems = info.web_cates_data;
          } else {
            this.haveData = false;
          }
          this.dropdownList = data.categories;
          this.cities = data.citites;
          console.log("have data=?", this.haveData);
        },
        (error) => {
          this.util.hide();
          console.log(error);
          this.util.apiErrorHandler(error);
          this.haveData = false;
        }
      )
      .catch((error) => {
        this.util.hide();
        console.log(error);
        this.util.apiErrorHandler(error);
        this.haveData = false;
      });
  }

  createSettings() {
    console.log(this.app_color);
    console.log(this.selectedItems);

    if (
      this.currencySymbol == "" ||
      this.currencySymbol == null ||
      this.currencyCode == "" ||
      this.currencyCode == null ||
      this.default_country_code == "" ||
      this.default_country_code == null ||
      this.fcm_token == "" ||
      this.fcm_token == null ||
      this.logo == "" ||
      this.logo == "" ||
      this.selectedItems.length <= 0 ||
      this.default_city_id == "" ||
      this.default_city_id == null ||
      this.default_delivery_zip == "" ||
      this.default_delivery_zip == null
    ) {
      this.util.error(this.util.translate("All fields are required"));
      return false;
    }
    if (this.sms_name == "0") {
      if (
        this.twilloCreds.sid == "" ||
        !this.twilloCreds.sid ||
        this.twilloCreds.token == "" ||
        !this.twilloCreds.token ||
        this.twilloCreds.from == "" ||
        !this.twilloCreds.from
      ) {
        this.util.error(this.util.translate("Twilio credentials missings"));
        return false;
      }
    }

    if (this.sms_name == "1") {
      if (
        this.msgCreds.key == "" ||
        !this.msgCreds.key ||
        this.msgCreds.sender == "" ||
        !this.msgCreds.sender
      ) {
        this.util.error(this.util.translate("Msg91 credentials missings"));
        return false;
      }
    }

    if (this.haveData == false) {
      console.log("create");
      this.create();
    } else {
      console.log("update");
      this.update();
    }
  }

  create() {
    const creds = {
      twilloCreds: this.twilloCreds,
      msg: this.msgCreds,
    };
    const ids = this.selectedItems.map((x: any) => x.id);
    console.log(ids);
    const param = {
      currencySymbol: this.currencySymbol,
      currencySide: this.currencySide,
      currencyCode: this.currencyCode,
      delivery: this.delivery,
      reset_pwd: this.reset_password,
      store_login: this.store_login,
      driver_login: this.driver_login,
      web_login: this.user_web_login,
      web_category: ids.join(),
      driver_assign: this.driver_assign,
      findType: this.findType,
      makeOrders: this.makeOrders,
      appDirection: this.appDirection,
      logo: this.logo,
      sms_name: this.sms_name,
      sms_creds: JSON.stringify(creds),
      user_login: this.user_login,
      status: 1,
      app_color: this.app_color,
      app_status: this.app_status,
      country_modal: JSON.stringify(this.country_modal),
      app_status_message: this.app_status_message,
      default_country_code: this.default_country_code,
      fcm_token: this.fcm_token,
      user_verify_with: this.user_verify_with,
      search_radius: this.search_radius,
      login_style: this.login_style,
      register_style: this.register_style,
      home_page_style_app: this.home_page_style_app,
      default_city_id: this.default_city_id,
      default_delivery_zip: this.default_delivery_zip,
      social: JSON.stringify(this.social),
    };
    console.log(param);

    this.util.show();
    this.api
      .post_private("v1/setttings/save", param)
      .then(
        (data: any) => {
          console.log(data);
          this.util.hide();
          if (data && data.status == 200) {
            this.getData();
            window.location.reload();
          }
        },
        (error) => {
          console.log(error);
          this.util.hide();
          this.util.apiErrorHandler(error);
        }
      )
      .catch((error) => {
        console.log(error);
        this.util.hide();
        this.util.apiErrorHandler(error);
      });
  }

  update() {
    const creds = {
      twilloCreds: this.twilloCreds,
      msg: this.msgCreds,
    };
    const ids = this.selectedItems.map((x: any) => x.id);
    console.log(ids);
    const param = {
      id: this.id,
      currencySymbol: this.currencySymbol,
      currencySide: this.currencySide,
      currencyCode: this.currencyCode,
      delivery: this.delivery,
      reset_pwd: this.reset_password,
      store_login: this.store_login,
      driver_login: this.driver_login,
      web_login: this.user_web_login,
      web_category: ids.join(),
      driver_assign: this.driver_assign,
      findType: this.findType,
      makeOrders: this.makeOrders,
      appDirection: this.appDirection,
      logo: this.logo,
      sms_name: this.sms_name,
      sms_creds: JSON.stringify(creds),
      user_login: this.user_login,
      status: 1,
      app_color: this.app_color,
      app_status: this.app_status,
      country_modal: JSON.stringify(this.country_modal),
      app_status_message: this.app_status_message,
      default_country_code: this.default_country_code,
      fcm_token: this.fcm_token,
      user_verify_with: this.user_verify_with,
      search_radius: this.search_radius,
      login_style: this.login_style,
      register_style: this.register_style,
      home_page_style_app: this.home_page_style_app,
      default_city_id: this.default_city_id,
      default_delivery_zip: this.default_delivery_zip,
      social: JSON.stringify(this.social),
    };
    console.log(param);

    this.util.show();
    this.api
      .post_private("v1/setttings/update", param)
      .then(
        (data: any) => {
          console.log(data);
          this.util.hide();
          if (data && data.status == 200) {
            this.getData();
            window.location.reload();
          }
        },
        (error) => {
          console.log(error);
          this.util.hide();
          this.util.apiErrorHandler(error);
        }
      )
      .catch((error) => {
        console.log(error);
        this.util.hide();
        this.util.apiErrorHandler(error);
      });
  }

  preview_banner(files: any) {
    console.log("fle", files);
    if (files.length == 0) {
      return;
    }
    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    if (files) {
      console.log("ok");
      this.util.show();
      this.api.uploadFile(files).subscribe(
        (data: any) => {
          console.log("==>>>>>>", data.data);
          this.util.hide();
          if (data && data.data.image_name) {
            this.logo = data.data.image_name;
          }
        },
        (error) => {
          console.log(error);
          this.util.hide();
          this.util.apiErrorHandler(error);
        }
      );
    } else {
      console.log("no");
    }
  }

  openCountryModel() {
    console.log("open moda");
    this.dummyLoad = Array(10);
    setTimeout(() => {
      this.dummyLoad = [];
      this.dummy = this.util.countrys;
      this.countries = this.dummy;
      this.util.countrys.forEach((element) => {
        const exist = this.country_modal.filter(
          (x) => x.country_code == element.country_code
        );
        element.isChecked = exist && exist.length ? true : false;
      });
      console.log(this.dummy);
    }, 500);
    this.largeModal.show();
  }

  onSearchChange(events: any) {
    console.log(events);
    if (events != "") {
      this.countries = this.dummy.filter((item) => {
        return (
          item.country_name.toLowerCase().indexOf(events.toLowerCase()) > -1
        );
      });
    } else {
      this.countries = [];
    }
  }

  changed() {
    this.selected = this.util.countrys.filter((x) => x.isChecked == true);
    console.log(this.selected);
  }

  saveCountries() {
    this.country_modal = this.selected;
    this.largeModal.hide();
  }
}
