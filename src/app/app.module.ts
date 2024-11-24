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
import { HttpClientModule } from '@angular/common/http';
import { LoaderComponent } from './shared/loader/loader.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { AddBlogComponent } from './pages/blogs/add-blog/add-blog.component';
import { ViewBlogComponent } from './pages/blogs/view-blog/view-blog.component';
import { MatDialogModule } from '@angular/material/dialog';

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
    ViewBlogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
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
    HttpClientModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatChipsModule,
    MatIconModule,
    MatDialogModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [TripPlannerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
