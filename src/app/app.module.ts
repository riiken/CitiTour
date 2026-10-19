import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HeroComponent } from './hero/hero.component';
import { GoogleAdsComponent } from './google-ads/google-ads.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AboutComponent } from './components/about/about.component';
import { BookingComponent } from './components/booking/booking.component';
import { ContactComponent } from './components/contact/contact.component';
import { ProcessComponent } from './components/process/process.component';
import { ServicesComponent } from './components/services/services.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { HotelDetailsComponent } from './components/hotel-details/hotel-details.component';
import { ResturantDetailsComponent } from './components/resturant-details/resturant-details.component';
import { TourDetailsComponent } from './components/tour-details/tour-details.component';
import { WeatherDisplayComponent } from './components/weather-display/weather-display.component';
import { ImageGalleryComponent } from './components/image-gallery/image-gallery.component';
import { TripPlannerComponent } from './pages/trip-planner/trip-planner.component';
import { TripViewComponent } from './pages/trip-view/trip-view.component';
import { PartnerLandingComponent } from './pages/partner/landing/partner-landing.component';
import { PartnerDashboardComponent } from './pages/partner/dashboard/partner-dashboard.component';
import { ListingFormComponent } from './pages/partner/listing-form/listing-form.component';
import { AdminComponent } from './pages/admin/admin.component';
import { PlaceComponent } from './pages/place/place.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { LoaderComponent } from './shared/loader/loader.component';
import { LocationPickerComponent } from './shared/location-picker/location-picker.component';
import { NavbarStickyDirective } from './navbar-sticky.directive';
import { BackToTopDirective } from './back-to-top.directive';
import { CurrencyConverterDirective } from './currency-converter.directive';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeroComponent,
    GoogleAdsComponent,
    NavbarComponent,
    AboutComponent,
    BookingComponent,
    ContactComponent,
    ProcessComponent,
    ServicesComponent,
    SearchResultsComponent,
    HotelDetailsComponent,
    ResturantDetailsComponent,
    TourDetailsComponent,
    WeatherDisplayComponent,
    ImageGalleryComponent,
    TripPlannerComponent,
    TripViewComponent,
    PartnerLandingComponent,
    PartnerDashboardComponent,
    ListingFormComponent,
    AdminComponent,
    PlaceComponent,
    PrivacyPolicyComponent,
    LoginComponent,
    RegisterComponent,
    UserDashboardComponent,
    LoaderComponent,
    LocationPickerComponent,
    NavbarStickyDirective,
    BackToTopDirective,
    CurrencyConverterDirective
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({ positionClass: 'toast-bottom-center', preventDuplicates: true }),
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    DatePipe,
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class AppModule {}
