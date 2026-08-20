/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
export const environment = {
  production: true,
  // baseUrl: "https://mamus.in/server/public/",
  baseUrl: "https://backend.mamus.in/public/",
  // imageUrl: "https://mamus.in/server/public/storage/app/public/images/",
  appName: "Mamus",
  realtime: {
    key: 'bff76da7aa456073e025',
    cluster: 'ap2',
    forceTLS: true,
    authEndpoint: 'https://backend.mamus.in/public/api/broadcasting/auth',
  },
};
