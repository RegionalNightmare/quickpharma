import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './component/header/header.component';
import { SidebarComponent } from './component/sidebar/sidebar.component';
import { OrderComponent } from './page/order/order.component';
import { InventoryComponent } from './page/inventory/inventory.component';
import { AlertsComponent } from './page/alerts/alerts.component';
import { OrderHistoryComponent } from './page/order-history/order-history.component';
import { SuppliersComponent } from './page/suppliers/suppliers.component';
import { ProfileComponent } from './page/profile/profile.component';
import { FooterComponent } from './component/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './page/home/home.component';

// Remove this import - it's wrong:
// import { SearchserviceComponent } from './component/searchservice/searchservice.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,        // ADD THIS
    SidebarComponent,
    OrderComponent,
    InventoryComponent,
    AlertsComponent,
    OrderHistoryComponent,
    SuppliersComponent,
    ProfileComponent,
    FooterComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
