import { Component } from '@angular/core';
import { GoogleAdsService } from './services/google-ads.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'CitiTour';
  isSidebarOpen = true;

  constructor(private googleAdsService:GoogleAdsService){}

  ngOnInit(){
    this.googleAdsService.loadAds();
    this.isSidebarOpen = window.innerWidth <=768  ? false : true;
  }
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebarEvent(val:boolean){
    console.log(val);
  }
}
