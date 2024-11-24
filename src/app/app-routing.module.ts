import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AddBusinessComponent } from './add-business/add-business.component';
import { ViewBusinessComponent } from './view-business/view-business.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TripPlannerComponent } from './pages/trip-planner/trip-planner.component';
import { BlogsComponent } from './pages/blogs/blogs.component';
import { PropertiesComponent } from './pages/properties/properties.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'blogs', component: BlogsComponent },
  { path: 'properties', component: PropertiesComponent },
  { path: 'plan-trip', component: TripPlannerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
