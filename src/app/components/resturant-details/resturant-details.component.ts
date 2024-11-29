import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-resturant-details',
  templateUrl: './resturant-details.component.html',
  styleUrls: ['./resturant-details.component.css']
})
export class ResturantDetailsComponent {

  @Input() restaurant:any;
  showMenu:boolean = false;

  toggleMenu(){
    this.showMenu = !this.showMenu;
  }
}
