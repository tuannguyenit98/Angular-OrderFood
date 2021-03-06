import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  OrderDetailSummaryModel,
  OrderSummaryModel,
} from 'src/app/shared/models/order/order.model';
import { OrderService } from 'src/app/shared/services/order.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AddOrderPopupComponent } from 'src/app/shared/component/popups/add-order-popup/add-order-popup.component';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-orders-detail',
  templateUrl: './orders-detail.component.html',
  styleUrls: ['./orders-detail.component.scss'],
})
export class OrdersDetailComponent implements OnInit {
  id: string;
  orderDetails: OrderDetailSummaryModel[];
  order: OrderSummaryModel;
  orderDetail: OrderDetailSummaryModel;
  totalPrice = 0;
  constructor(
    private orderService: OrderService,
    private router: ActivatedRoute,
    private modalService: NzModalService,
    private nzNotificationService: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.id = this.router.snapshot.paramMap.get('id');
    forkJoin([
      this.orderService.getOrdersById(this.id),
      this.orderService.getOrderDetailsByOrderId(this.id),
    ]).subscribe(([res1, res2]) => {
      this.order = res1;
      this.orderDetails = res2;
      this.orderDetails.forEach((x) => (this.totalPrice += x.price));
    });
  }

  getApiOrderDetail(): void {
    this.totalPrice = 0;
    this.orderService.getOrderDetailsByOrderId(this.id).subscribe((res) => {
      this.orderDetails = res;
      this.orderDetails.forEach((x) => (this.totalPrice += x.price));
    });
  }

  showAddOrderPopup(order, orderDetails): void {
    const modal = this.modalService.create({
      nzContent: AddOrderPopupComponent,
      nzComponentParams: {
        order,
        orderDetails,
      },
    });
    modal.afterClose.subscribe((result) => {
      if (result && result.isSuccess) {
        this.getApiOrderDetail();
      }
    });
  }

  increaseAmount(productId, amount: number): void {
    const orderForm = {
      orderId: this.order.id,
      productId,
      amount: amount + 1,
    };
    if (orderForm != null) {
      this.orderService.updateOrderDetail(orderForm).subscribe((res) => {
        if (res) {
          this.nzNotificationService.success(
            'Th??ng b??o',
            'C???p nh???t ????n h??ng th??nh c??ng!'
          );
          this.getApiOrderDetail();
        } else {
          this.nzNotificationService.error(
            'Th??ng b??o',
            'C?? l???i x???y. Vui l??ng ki???m tra l???i!'
          );
        }
      });
    }
  }

  decreaseAmount(productId, amount: number): void {
    const orderForm = {
      orderId: this.order.id,
      productId,
      amount: amount - 1,
    };
    if (orderForm != null) {
      this.orderService.updateOrderDetail(orderForm).subscribe((res) => {
        if (res) {
          this.nzNotificationService.success(
            'Th??ng b??o',
            'C???p nh???t ????n h??ng th??nh c??ng!'
          );
          this.getApiOrderDetail();
        } else {
          this.nzNotificationService.error(
            'Th??ng b??o',
            'C?? l???i x???y. Vui l??ng ki???m tra l???i!'
          );
        }
      });
    }
  }

  delete(item): void {
    const orderDetail = {
      orderId: this.order.id,
      productId: item.product.id,
    };
    this.orderService.deleteOrderDetail(orderDetail).subscribe((result) => {
      if (result) {
        this.nzNotificationService.success(
          'Th??ng b??o',
          `X??a th??nh c??ng s???n ph???m ${item.product.productName} trong ????n h??ng`
        );
        this.getApiOrderDetail();
      } else {
        this.nzNotificationService.error(
          'Th??ng b??o',
          'C?? l???i x???y ra. Vui l??ng ki???m tra l???i!'
        );
      }
    });
  }

  closeOrCancelOrder(numberState): void {
    const changeForm = {
      orderId: this.order.id,
      orderState: numberState === 0 ? 0 : 2,
    };
    this.orderService.changeStatus(changeForm).subscribe((result) => {
      if (result && numberState === 2) {
        this.nzNotificationService.success(
          'Th??ng b??o',
          `Ch???t ????n h??ng s??? ${this.order.orderCode} th??nh c??ng!`
        );
        this.orderService.getOrdersById(this.id).subscribe((res) => {
          this.order = res;
        });
      } else if (result && numberState === 0) {
        this.nzNotificationService.success(
          'Th??ng b??o',
          `H???y ????n h??ng s??? ${this.order.orderCode} th??nh c??ng!`
        );
        this.orderService.getOrdersById(this.id).subscribe((res) => {
          this.order = res;
        });
      } else {
        this.nzNotificationService.error(
          'Th??ng b??o',
          'C?? l???i x???y ra. Vui l??ng ki???m tra l???i!'
        );
      }
    });
  }
}
