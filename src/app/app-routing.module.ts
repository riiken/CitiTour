import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TripPlannerComponent } from './pages/trip-planner/trip-planner.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { ExploreComponent } from './pages/explore/explore.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { TermsComponent } from './pages/terms/terms.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { TripViewComponent } from './pages/trip-view/trip-view.component';
import { PartnerLandingComponent } from './pages/partner/landing/partner-landing.component';
import { PartnerDashboardComponent } from './pages/partner/dashboard/partner-dashboard.component';
import { ListingFormComponent } from './pages/partner/listing-form/listing-form.component';
import { AdminComponent } from './pages/admin/admin.component';
import { PlaceComponent } from './pages/place/place.component';
import { MyTripsComponent } from './pages/my-trips/my-trips.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, title: 'CitiTour – AI trip planner for India' },
  { path: 'explore', component: ExploreComponent, title: 'Explore – CitiTour', data: { description: 'Things to see, places to stay and where to eat across India, from real travel guides, with maps and booking links.' } },
  { path: 'explore/:destination', component: ExploreComponent, title: 'Explore – CitiTour' },
  { path: 'search-results', redirectTo: '/explore' },
  { path: 'plan-trip', component: TripPlannerComponent, title: 'Plan your trip – CitiTour', data: { description: 'Tell us where and when: get a day-by-day India trip plan with real places, a map, stays for your dates and a packing list.' } },
  { path: 'trip/:id', component: TripViewComponent, title: 'Your trip – CitiTour' },
  { path: 'login', component: LoginComponent, title: 'Log in – CitiTour' },
  { path: 'register', component: RegisterComponent, title: 'Create account – CitiTour' },
  { path: 'forgot-password', component: ForgotPasswordComponent, title: 'Forgot password – CitiTour' },
  { path: 'reset-password', component: ResetPasswordComponent, title: 'Set a new password – CitiTour' },
  { path: 'user-dashboard', component: UserDashboardComponent, canActivate: [AuthGuard], title: 'My account – CitiTour' },
  { path: 'my-trips', component: MyTripsComponent, canActivate: [AuthGuard], title: 'My trips – CitiTour' },
  { path: 'place/:id', component: PlaceComponent, title: 'CitiTour' },
  { path: 'list-your-business', component: PartnerLandingComponent, title: 'List your business – CitiTour', data: { description: 'Own a homestay, hotel, restaurant or tour? List it free on CitiTour and get enquiries from travellers on WhatsApp and phone.' } },
  { path: 'partner', component: PartnerDashboardComponent, canActivate: [AuthGuard], title: 'My listings – CitiTour' },
  { path: 'partner/new', component: ListingFormComponent, canActivate: [AuthGuard], title: 'Add your business – CitiTour' },
  { path: 'partner/edit/:id', component: ListingFormComponent, canActivate: [AuthGuard], title: 'Edit listing – CitiTour' },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard], title: 'Admin – CitiTour' },
  { path: 'about', component: AboutComponent, title: 'About – CitiTour', data: { description: 'How CitiTour builds trip plans only from real places, and how we keep recommendations honest.' } },
  { path: 'services', redirectTo: '/about' },
  { path: 'contact', component: ContactComponent, title: 'Contact – CitiTour', data: { description: 'Questions, feedback or partnership ideas? Get in touch with the CitiTour team.' } },
  { path: 'privacy-policy', component: PrivacyPolicyComponent, title: 'Privacy policy – CitiTour', data: { description: 'How CitiTour collects, uses and protects your information.' } },
  { path: 'terms', component: TermsComponent, title: 'Terms of use – CitiTour', data: { description: 'The terms for using CitiTour\'s trip plans, booking links, business listings and accounts.' } },
  // Retired demo pages
  { path: 'booking', redirectTo: '/plan-trip' },
  { path: 'destination', redirectTo: '/explore' },
  { path: 'dashboard', redirectTo: '/user-dashboard' },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
