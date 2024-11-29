import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AddBusinessComponent } from './add-business/add-business.component';
import { ViewBusinessComponent } from './view-business/view-business.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TripPlannerComponent } from './pages/trip-planner/trip-planner.component';
import { BlogsComponent } from './pages/blogs/blogs.component';
import { PropertiesComponent } from './pages/properties/properties.component';
import { ViewBlogComponent } from './pages/blogs/view-blog/view-blog.component';
import { AboutComponent } from './components/about/about.component';
import { BookingComponent } from './components/booking/booking.component';
import { DestinationComponent } from './components/destination/destination.component';
import { PackageComponent } from './components/package/package.component';
import { ProcessComponent } from './components/process/process.component';
import { ServicesComponent } from './components/services/services.component';
import { HeroComponent } from './hero/hero.component';
import { ContactComponent } from './components/contact/contact.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {path: 'home',component:HomeComponent},
  { path: 'dashboard', component: DashboardComponent },
  { path: 'blogs', component: BlogsComponent },
  { path: 'properties', component: PropertiesComponent },
  { path: 'plan-trip', component: TripPlannerComponent },
  { path: 'blog/:id', component: ViewBlogComponent },
  { path: 'about', component: AboutComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'destination', component: DestinationComponent },
  { path: 'package', component: PackageComponent },
  { path: 'process', component: ProcessComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'hero', component: HeroComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'search-results', component: SearchResultsComponent },
  { path: '**', redirectTo: '' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
