import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AddBusinessComponent } from './add-business/add-business.component';
import { ViewBusinessComponent } from './view-business/view-business.component';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoogleAdsComponent } from './google-ads/google-ads.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CardComponent } from './components/card/card.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TripPlannerComponent } from './pages/trip-planner/trip-planner.component';
import { BlogsComponent } from './pages/blogs/blogs.component';
import { PropertiesComponent } from './pages/properties/properties.component';
import { MatSelectModule } from '@angular/material/select';
import { TripPlannerService } from './services/trip-planner.service';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { LoaderComponent } from './shared/loader/loader.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { AddBlogComponent } from './pages/blogs/add-blog/add-blog.component';
import { ViewBlogComponent } from './pages/blogs/view-blog/view-blog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { BookingComponent } from './components/booking/booking.component';
import { ProcessComponent } from './components/process/process.component';
import { ServicesComponent } from './components/services/services.component';
import { AboutComponent } from './components/about/about.component';
import { DestinationComponent } from './components/destination/destination.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { PackageComponent } from './components/package/package.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarStickyDirective } from './navbar-sticky.directive';
import { HeroComponent } from './hero/hero.component';
import { ContactComponent } from './components/contact/contact.component';
import { BackToTopDirective } from './back-to-top.directive';
import { HotelDetailsComponent } from './components/hotel-details/hotel-details.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { ResturantDetailsComponent } from './components/resturant-details/resturant-details.component';
import { TourDetailsComponent } from './components/tour-details/tour-details.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent,
    AddBusinessComponent,
    ViewBusinessComponent,
    HomeComponent,
    GoogleAdsComponent,
    NavbarComponent,
    SidebarComponent,
    CardComponent,
    DashboardComponent,
    TripPlannerComponent,
    BlogsComponent,
    PropertiesComponent,
    LoaderComponent,
    AddBlogComponent,
    ViewBlogComponent,
    BookingComponent,
    ProcessComponent,
    ServicesComponent,
    AboutComponent,
    DestinationComponent,
    TopbarComponent,
    PackageComponent,
    FooterComponent,
    NavbarStickyDirective,
    HeroComponent,
    ContactComponent,
    BackToTopDirective,
    HotelDetailsComponent,
    SearchResultsComponent,
    ResturantDetailsComponent,
    TourDetailsComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatGridListModule,
    MatDividerModule,
    MatListModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatChipsModule,
    MatIconModule,
    MatDialogModule,
    NgbModule,
  ],
  providers: [TripPlannerService,DatePipe, provideHttpClient(withInterceptorsFromDi())],
})
export class AppModule {}
