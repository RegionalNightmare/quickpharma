import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './page/dashboard/dashboard.component';
import { OrderComponent } from './page/order/order.component';
import { InventoryComponent } from './page/inventory/inventory.component';
import { AlertsComponent } from './page/alerts/alerts.component';
import { OrderHistoryComponent } from './page/order-history/order-history.component';
import { SuppliersComponent } from './page/suppliers/suppliers.component';
import { ProfileComponent } from './page/profile/profile.component';

const routes: Routes = [
  { path: 'dashboard', component:DashboardComponent },
  { path: 'order', component:OrderComponent },
  { path: 'inventory', component:InventoryComponent},
  { path: 'alerts', component:AlertsComponent  },
  { path: 'order-history', component:OrderHistoryComponent },
  { path: 'suppliers', component:SuppliersComponent },
  { path: 'profile', component:ProfileComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
