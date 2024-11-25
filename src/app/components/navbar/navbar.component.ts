import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  encapsulation:ViewEncapsulation.None
})
export class NavbarComponent {
  mobileVersion: boolean;

  constructor(){
    this.mobileVersion = window.innerWidth <= 768;
  }
  @Output() toggleSidebar = new EventEmitter<void>();
  activeNav: any = 'home';

  toggleSidebarFUn() {
    this.toggleSidebar.emit(); // Emit event to toggle the sidebar
  }

  navClicked(item:any){
    this.activeNav = item;
  }

}
