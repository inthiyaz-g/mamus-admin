/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
export const environment = {
  production: false,
  // baseUrl: "http://127.0.0.1:8000/",
  baseUrl: "https://backend.mamus.in/public/",
  // imageUrl: "http://127.0.0.1:8000/storage/images/",
  realtime: {
    key: 'bff76da7aa456073e025',
    cluster: 'ap2',
    forceTLS: true,
    authEndpoint: 'https://backend.mamus.in/public/api/broadcasting/auth',
  },
};
