import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrdersCreateComponent } from './orders-create/orders-create.component';
import { OrdersDetailComponent } from './orders-detail/orders-detail.component';
import { OrdersViewComponent } from './orders-view/orders-view.component';
import { OrdersComponent } from './orders.component';

const routes: Routes = [
  {
    path: '',
    component: OrdersComponent,
    children: [
      {
        path: '',
        redirectTo: 'view',
        pathMatch: 'full'
      },
      {
        path: 'view',
        component: OrdersViewComponent,
        data: {
          title: 'Order-view'
        }
      },
      {
        path: 'detail/:id',
        component: OrdersDetailComponent,
        data: {
          title: 'Order-detail'
        }
      },
      {
        path: 'add-order/:id',
        component: OrdersCreateComponent,
        data: {
          title: 'Order-create'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
