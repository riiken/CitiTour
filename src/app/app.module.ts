import { LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeHi from '@angular/common/locales/hi';
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
import { WeatherDisplayComponent } from './components/weather-display/weather-display.component';
import { ImageGalleryComponent } from './components/image-gallery/image-gallery.component';
import { TripPlannerComponent } from './pages/trip-planner/trip-planner.component';
import { TripViewComponent } from './pages/trip-view/trip-view.component';
import { PartnerLandingComponent } from './pages/partner/landing/partner-landing.component';
import { PartnerDashboardComponent } from './pages/partner/dashboard/partner-dashboard.component';
import { ListingFormComponent } from './pages/partner/listing-form/listing-form.component';
import { AdminComponent } from './pages/admin/admin.component';
import { PlaceComponent } from './pages/place/place.component';
import { MyTripsComponent } from './pages/my-trips/my-trips.component';
import { ExploreComponent } from './pages/explore/explore.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { LoaderComponent } from './shared/loader/loader.component';
import { LocationPickerComponent } from './shared/location-picker/location-picker.component';
import { NavbarStickyDirective } from './navbar-sticky.directive';
import { BackToTopDirective } from './back-to-top.directive';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { TranslatePipe } from './i18n/translate.pipe';
import { storedLanguage } from './i18n/i18n.service';

registerLocaleData(localeHi);

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
    WeatherDisplayComponent,
    ImageGalleryComponent,
    TripPlannerComponent,
    TripViewComponent,
    PartnerLandingComponent,
    PartnerDashboardComponent,
    ListingFormComponent,
    AdminComponent,
    PlaceComponent,
    MyTripsComponent,
    ExploreComponent,
    PrivacyPolicyComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    UserDashboardComponent,
    LoaderComponent,
    LocationPickerComponent,
    NavbarStickyDirective,
    BackToTopDirective,
    TranslatePipe
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
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    // Dates and numbers follow the chosen language (fixed per page load)
    { provide: LOCALE_ID, useFactory: () => (storedLanguage() === 'hi' ? 'hi' : 'en-US') }
  ]
})
export class AppModule {}
