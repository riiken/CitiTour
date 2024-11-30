import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  email: string = '';
  galleryImages: string[] = [
    'assets/img/package-1.jpg',
    'assets/img/package-2.jpg',
    'assets/img/package-3.jpg',
    'assets/img/package-2.jpg',
    'assets/img/package-3.jpg',
    'assets/img/package-1.jpg'
  ];

  constructor(private taostr:ToastrService){}
  subscribe() {
    console.log('Subscribed with email:', this.email);
    this.taostr.success('Subscribed with email:', this.email)
  }
}
