import { Component } from '@angular/core';
import { GoogleAdsService } from './services/google-ads.service';
import { TripPlannerService } from './services/trip-planner.service';
import { AdMob } from '@capacitor-community/admob';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'CitiTour';
  isSidebarOpen = true;

  constructor(private googleAdsService:GoogleAdsService,private tripPlanner:TripPlannerService){}

  ngOnInit(){
    this.initializeAdMob();
    this.isSidebarOpen = window.innerWidth <=768  ? false : true;
    this.setCurrentUserCountry();
  }
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  async initializeAdMob() {
    await AdMob.initialize({
      initializeForTesting: true,
    });
  }

  setCurrentUserCountry(){
    this.tripPlanner.getUserLocation().subscribe((data) => {
      console.log(data);
      localStorage.setItem('currency',data?.currency);
    });
  }

  closeSidebarEvent(val:boolean){
    console.log(val);
  }
}
