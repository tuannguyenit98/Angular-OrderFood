import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AuthenticationModel } from 'src/app/shared/models/auth/authentication.model';
import {
  AddOrderDetailModel,
  OrderDetailModel,
  OrderDetailSummaryModel,
  OrderSummaryModel,
} from 'src/app/shared/models/order/order.model';
import { ProductDataFilter } from 'src/app/shared/models/product/product-data-filter.model';
import { ProductSummaryModel } from 'src/app/shared/models/product/product.model';
import { StoreSummaryModel } from 'src/app/shared/models/store/store.model';
import { UserData } from 'src/app/shared/models/user/user-data.model';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { ProductService } from 'src/app/shared/services/product.service';
import { StoreService } from 'src/app/shared/services/store.service';
import { UserService } from 'src/app/shared/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-detail-store',
  templateUrl: './detail-store.component.html',
  styleUrls: ['./detail-store.component.scss'],
})
export class DetailStoreComponent implements OnInit {
  id: string;
  store: StoreSummaryModel;
  products: ProductSummaryModel[];
  categories: any;
  url = environment.API_ENDPOINT_LOCAL;
  searchTerm$ = new BehaviorSubject('');
  filterModel: ProductDataFilter = new ProductDataFilter();
  listOrderDetail: any[] = [];
  totalPrice = 0;
  userLogin: AuthenticationModel;
  user: UserData;
  orderDetails: OrderDetailSummaryModel[];
  order: OrderSummaryModel;
  constructor(
    private storeService: StoreService,
    private router: ActivatedRoute,
    private productService: ProductService,
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.id = this.router.snapshot.paramMap.get('id');
    this.userLogin = this.authenticationService.getAuthenticationModel();
    forkJoin([
      this.storeService.getStoreByStoreId(this.id),
      this.productService.getAllCategory(),
      this.userService.getUserById(this.userLogin.userId),
      this.orderService.getOrderByStoreIdAndUserId(
        this.id,
        this.userLogin.userId
      ),
    ]).subscribe(([result1, result2, result3, result4]) => {
      this.store = result1;
      this.categories = result2;
      this.user = result3;
      this.order = result4;
      if (this.order) {
        this.getApiOrderDetail();
      }
    });
    this.searchTerm$.pipe(debounceTime(200)).subscribe((_) => {
      this.filterModel.keyWord = this.searchTerm$.value.trim();
      this.filterProduct();
    });
  }

  filterProduct(): void {
    this.filterModel.storeId = this.id;
    const filter = { ...this.filterModel };
    this.productService.getListProductByStoreId(filter).subscribe((res) => {
      this.products = res;
    });
  }

  getApiOrderDetail(): void {
    this.totalPrice = 0;
    this.orderService
      .getOrderDetailsByOrderId(this.order.id)
      .subscribe((res) => {
        this.orderDetails = res;
        this.orderDetails.forEach((x) => (this.totalPrice += x.price));
      });
  }

  increaseAmount(product): void {
    let orderForm: any;
    if (this.orderDetails) {
      for (const x of [...this.orderDetails]) {
        if (x.product.id === product.id) {
          orderForm = {
            orderId: this.order.id,
            productId: product.id,
            amount: x.amount + 1,
          };
          this.orderService.updateOrderDetail(orderForm).subscribe((res) => {
            if (res) {
              this.orderService.getOrderByStoreIdAndUserId(
                this.id,
                this.userLogin.userId
              ).subscribe((result) => {
                this.order = result;
              });
              this.getApiOrderDetail();
            }
          });
        } else {
          // tslint:disable-next-line:prefer-const
          let orderDetails: OrderDetailModel[] = [];
          orderForm = {
            orderId: this.order.id,
            productId: product.id,
            amount: 1,
            price: product.price,
            orderDetailNote: '',
          };
          orderDetails.push(orderForm);
          this.orderService.addOrderDetails(orderDetails).subscribe((res) => {
            if (res) {
              this.getApiOrderDetail();
            }
          });
        }
      }
    }

    if (!this.orderDetails) {
      orderForm = {
        userId: this.userLogin.userId,
        storeId: this.store.id,
        orderNote: '',
        orderDetails: [
          {
            productId: product.id,
            amount: 1,
            price: product.price,
            orderDetailNote: '',
          },
        ],
      };
      this.orderService.createOrder(orderForm).subscribe((res) => {
        if (res) {
          this.getApiOrderDetail();
        }
      });
    }
  }

  decreaseAmount(product, amount): void {
    let orderForm: any;
    if (this.orderDetails.length > 0 && amount > 1) {
      for (const x of [...this.orderDetails]) {
        if (x.product.id === product.id) {
          orderForm = {
            orderId: this.order.id,
            productId: product.id,
            amount: x.amount - 1,
          };
        }
      }
      if (orderForm != null) {
        this.orderService.updateOrderDetail(orderForm).subscribe((res) => {
          if (res) {
            this.getApiOrderDetail();
          }
        });
      }
    }
    if (amount === 1) {
      const orderDetail = {
        orderId: this.order.id,
        productId: product.id,
      };
      this.orderService.deleteOrderDetail(orderDetail).subscribe((result) => {
        if (result) {
          this.getApiOrderDetail();
        }
      });
    }
  }

  deleteAll(): void{
    const orderDetailForm: any[] = [];
    for (const x of [...this.orderDetails]) {
      const orderDetail = {
        orderId: this.order.id,
        productId: x.product.id
      };
      orderDetailForm.push(orderDetail);
    }
    this.orderService.deleteAllOrderDetail(orderDetailForm).subscribe((result) => {
      if (result) {
        this.getApiOrderDetail();
      }
    });
  }

  // increaseAmount(item): void {
  //   let checkProduct = false;
  //   if (this.listOrderDetail.length > 0) {
  //     for (const x of [...this.listOrderDetail]) {
  //       if (x.productId === item.id) {
  //         checkProduct = true;
  //         x.amount += 1;
  //         x.price = item.price * x.amount;
  //       }
  //     }
  //   }

  //   if (this.listOrderDetail.length === 0 || checkProduct === false) {
  //     const orderDetail = {
  //       productId: item.id,
  //       productName: item.productName,
  //       price: item.price,
  //       amount: 1,
  //       OrderDetailNote: '',
  //     };
  //     this.listOrderDetail.push(orderDetail);
  //   }
  //   this.totalPrice = 0;
  //   this.listOrderDetail.forEach((x) => (this.totalPrice += x.price));
  // }
}