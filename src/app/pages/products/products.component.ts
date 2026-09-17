/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  @ViewChild('myModal3') public myModal3: ModalDirective;
  dummy: any[] = [];
  list: any[] = [];
  totalProducts: any = 0;
  page: number = 1;
  inputString: any = '';
  cities: any[] = [];
  selectedCities: any = '';
  creatingProduct = false;
  savingProduct = false;
  uploadingProduct = false;
  productError = '';
  productStores: any[] = [];
  productCategories: any[] = [];
  productSubcategories: any[] = [];
  newProduct: any = {};
  productUnits = ['gram', 'kg', 'liter', 'ml', 'pcs'];
  productFlags = [
    { key: 'status', label: 'Active product' }, { key: 'in_stoke', label: 'In stock' },
    { key: 'in_home', label: 'Show on home' }, { key: 'in_offer', label: 'Show in offers' },
    { key: 'is_single', label: 'Single product' }, { key: 'allow_only_one_per_cart', label: 'Only one per cart' }
  ];
  productVariants: any[] = [];
  productGallery: string[] = [];

  calculateProductPrice() {
    this.newProduct.sell_price = Number((Number(this.newProduct.original_price || 0) * (1 - Number(this.newProduct.discount || 0) / 100)).toFixed(2));
  }

  addProductVariant() { this.productVariants.push({ title: '', price: null, discount: 0 }); }

  async openCreateProduct() {
    this.creatingProduct = true;
    this.productError = '';
    this.newProduct = { store_id: '', cate_id: '', sub_cate_id: '', name: '', cover: '', original_price: null, delivery_type: 'scheduled', kind: 1, descriptions: '' };
    Object.assign(this.newProduct, { discount: 0, sell_price: 0, size: 0, status: 1, in_stoke: 1,
      in_home: 0, in_offer: 0, is_single: 0, allow_only_one_per_cart: 0, one_per_cart_message: '',
      key_features: '', disclaimer: '', exp_date: '2030-12-31', type_of: 1 });
    this.productUnits.forEach(unit => { this.newProduct['have_' + unit] = unit === 'pcs' ? 1 : 0; this.newProduct[unit] = unit === 'pcs' ? 1 : 0; });
    this.productVariants = [];
    this.productGallery = [];
    this.productSubcategories = [];
    try {
      const [stores, categories]: any[] = await Promise.all([
        this.api.get_private('v1/store/getAll'), this.api.get_private('v1/category/getAll')
      ]);
      this.productStores = stores.data || [];
      this.productCategories = categories.data || [];
    } catch { this.productError = 'Unable to load stores and categories. Please try again.'; }
  }

  async productCategoryChanged() {
    this.newProduct.sub_cate_id = '';
    this.productSubcategories = [];
    const category = this.newProduct.cate_id;
    try {
      const result: any = await this.api.post_private('v1/subCategories/getFromCateId', { id: category });
      if (category === this.newProduct.cate_id) this.productSubcategories = result.data || [];
    } catch { this.productError = 'Unable to load subcategories.'; }
  }

  uploadProductImage(event: any, gallery = false) {
    if (this.uploadingProduct || this.savingProduct) return;
    if (gallery && this.productGallery.length >= 6) { this.productError = 'You can add up to six additional images.'; return; }
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      this.productError = 'Choose a JPG, PNG or WebP image smaller than 5 MB.'; return;
    }
    this.uploadingProduct = true;
    this.productError = '';
    this.api.uploadFile([file]).subscribe((result: any) => {
      this.uploadingProduct = false;
      if (result?.data?.image_name) {
        if (gallery) this.productGallery.push(result.data.image_name);
        else this.newProduct.cover = result.data.image_name;
      }
      else this.productError = 'Image upload failed. Please try again.';
    }, () => { this.uploadingProduct = false; this.productError = 'Image upload failed. Please try again.'; });
  }

  async saveNewProduct() {
    if (this.savingProduct || this.uploadingProduct) return;
    const p = this.newProduct;
    if (!p.store_id || !p.cate_id || !p.sub_cate_id || !p.name?.trim() || !p.cover || !(Number(p.original_price) > 0)) {
      this.productError = 'Select a store, category and subcategory, and enter a name, image and valid price.'; return;
    }
    if (Number(p.discount) < 0 || Number(p.discount) > 100 || !Number.isFinite(Number(p.discount))) {
      this.productError = 'Discount must be between 0 and 100%.'; return;
    }
    if (this.productUnits.some(unit => p['have_' + unit] == 1 && !(Number(p[unit]) > 0))) {
      this.productError = 'Enter a positive quantity for each enabled unit.'; return;
    }
    if (p.size == 1 && (!this.productVariants.length || this.productVariants.some(v => !v.title?.trim() || !(Number(v.price) > 0) || Number(v.discount) < 0 || Number(v.discount) > Number(v.price)))) {
      this.productError = 'Add at least one size with a name, positive price and sale price between zero and its original price.'; return;
    }
    this.calculateProductPrice();
    this.savingProduct = true;
    this.productError = '';
    try {
      const price = Number(Number(p.original_price).toFixed(2));
      const result: any = await this.api.post_private('v1/products/create', {
        ...p, name: p.name.trim(), original_price: price, exp_date: '2030-12-31',
        images: JSON.stringify(this.productGallery),
        variations: JSON.stringify(p.size == 1 ? [{ title: 'size', type: 'radio', items: this.productVariants.map(v => ({ title: v.title.trim(), price: Number(v.price), discount: Number(v.discount || 0) })) }] : []),
        rating: 0, total_rating: 0,
        ...Object.fromEntries(this.productUnits.map(unit => [unit, p['have_' + unit] == 1 ? Number(p[unit]) : 0]))
      });
      if (result?.status !== 200 || !result?.success) throw new Error('Unable to create product.');
      this.creatingProduct = false;
      this.util.success('Product added to the selected store.');
      this.page = 1;
      this.getList();
    } catch (error: any) { this.productError = error?.error?.message || error.message || 'Unable to create product.'; }
    finally { this.savingProduct = false; }
  }
  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router
  ) {
    this.getList();
  }

  getList() {
    this.dummy = Array(10);
    this.list = [];
    this.api.get_private('v1/products/getAll?page=' + (this.page - 1)).then((data: any) => {
      console.log(data);
      this.dummy = [];
      if (data && data.status && data.status == 200 && data.data && data.data.length) {
        this.list = data.data;
        this.totalProducts = data.totalProducts;
        console.log(Object.keys(this.list[0]));
      }
    }, error => {
      console.log(error);
      this.dummy = [];
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.dummy = [];
      this.util.apiErrorHandler(error);
    });
  }

  pageChange(event: any) {
    console.log(event);
    this.page = event;
    console.log('page->', this.page)
    this.getList();
  }


  ngOnInit(): void {
  }


  changeStatus(item: any) {
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
            this.getList();
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
    //products/updateStatus
  }

  search() {
    if (this.inputString != '') {
      console.log('search data', this.inputString);
      this.totalProducts = 0;
      this.page = 0;
      this.dummy = Array(10);
      this.list = [];
      this.api.post_private('v1/products/searchAdminWithId', { id: this.inputString }).then((data: any) => {
        this.dummy = [];
        if (data && data.status && data.status == 200 && data.success) {
          console.log(">>>>>", data);
          if (data && data.data.length > 0) {
            this.list = data.data;
            console.log("---", this.list);
          }
        }
      }, error => {
        this.dummy = [];
        console.log('Error', error);
        this.util.apiErrorHandler(error);
      }).catch(error => {
        this.dummy = [];
        console.log('Err', error);
        this.util.apiErrorHandler(error);
      });
    }
  }

  clean() {
    this.inputString = '';
    this.page = 1;
    this.getList();
  }

  inHome(item: any) {
    const body = {
      id: item.id,
      in_home: item.in_home == 0 ? 1 : 0
    };
    console.log("========", body);
    this.util.show();
    this.api.post_private('v1/products/updateHome', body).then((data: any) => {
      this.util.hide();
      console.log("+++++++++++++++", data);
      if (data && data.status && data.status == 200 && data.success) {
        this.util.success(this.util.translate('Status Updated !'));
        this.getList();
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

  inOffers(item: any) {
    const body = {
      id: item.id,
      in_offer: item.in_offer == 0 ? 1 : 0
    };
    console.log("========", body);
    this.util.show();
    this.api.post_private('v1/products/updateOffers', body).then((data: any) => {
      this.util.hide();
      console.log("+++++++++++++++", data);
      if (data && data.status && data.status == 200 && data.success) {
        this.util.success(this.util.translate('Status Updated !'));
        this.getList();
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

  updateDeliveryType(item: any, deliveryType: string) {
    const previousType = item.delivery_type === 'instant' ? 'instant' : 'scheduled';
    if (deliveryType === previousType) {
      return;
    }

    this.util.show();
    this.api.post_private('v1/products/updateDeliveryType', {
      id: item.id,
      delivery_type: deliveryType,
    }).then((data: any) => {
      this.util.hide();
      if (data?.status === 200 && data?.success) {
        item.delivery_type = deliveryType;
        this.util.success(this.util.translate('Delivery type updated'));
      } else {
        item.delivery_type = previousType;
        this.util.error(data?.message || this.util.translate('Unable to update delivery type'));
      }
    }, (error) => {
      this.util.hide();
      item.delivery_type = previousType;
      this.util.apiErrorHandler(error);
    });
  }

  addNew() {
    this.openCreateProduct();
  }

  exportCSV() {
    let data: any = [];
    this.list.forEach(element => {
      const info = {
        'id': this.util.replaceWithDot(element.id),
        'name': this.util.replaceWithDot(element.name),
        'cover': this.util.replaceWithDot(element.cover),
        'original_price': this.util.replaceWithDot(element.original_price),
        'sell_price': this.util.replaceWithDot(element.sell_price),
        'certificate_url': this.util.replaceWithDot(element.certificate_url),
        'in_stoke': this.util.replaceWithDot(element.in_stoke),
        'rating': this.util.replaceWithDot(element.rating),
        'total_rating': this.util.replaceWithDot(element.total_rating),
        'in_home': this.util.replaceWithDot(element.in_home),
        'in_offer': this.util.replaceWithDot(element.in_offer),
        'delivery_type': this.util.replaceWithDot(element.delivery_type || 'scheduled'),
      }
      data.push(info);
    });
    const name = 'products';
    this.util.downloadFile(data, name, ['id', 'name', 'cover', 'original_price', 'sell_price', 'in_stoke', 'rating', 'total_rating', 'in_home', 'in_offer', 'delivery_type']);
  }

  saveType() {
    this.myModal3.hide();
  }

  uploadCSV(files: any) {
    console.log('fle', files);
    if (files.length == 0) {
      return;
    }
    const mimeType = files[0].type;
    if (mimeType.match(/text\/*/) == null) {
      return;
    }

    if (files) {
      console.log('ok');
      this.util.show();
      this.api.uploaCSV(files, 'v1/products/importData').subscribe((data: any) => {
        console.log('==>>>>>>', data.data);
        this.util.hide();
        this.myModal3.hide();
        this.util.success('Uploaded');
        this.getList();
      }, err => {
        console.log(err);
        this.util.hide();
        this.util.apiErrorHandler(err);
      });
    } else {
      console.log('no');
    }
  }

  importCSV() {
    this.myModal3.show();
  }

  downloadSample() {
    window.open('assets/sample/products.csv', '_blank');
  }

}
