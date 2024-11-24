import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() open: boolean = true;
  @Output() closeSidebarEvent = new EventEmitter<boolean>();
  showLogo: boolean | undefined;
  ngOnInit(){
    this.showLogo = window.innerWidth <=768 ? false : true;
  }

  closeSideBar(){
    this.closeSidebarEvent.emit(false);
  }
}
