import { Component } from '@angular/core';

@Component({
  selector: 'app-package',
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.css']
})
export class PackageComponent {
  packages = [
    { name: 'Package 1', destination: 'Thailand', duration: '3 days', people: 2, price: '$149.00', rating: [1, 1, 1, 1, 1], image: 'assets/img/package-1.jpg', description: 'Tempor erat elitr rebum at clita.' },
    { name: 'Package 2', destination: 'Indonesia', duration: '3 days', people: 2, price: '$139.00', rating: [1, 1, 1, 1, 1], image: 'assets/img/package-2.jpg', description: 'Diam dolor diam ipsum sit diam amet diam eos.' },
    { name: 'Package 3', destination: 'Malaysia', duration: '3 days', people: 2, price: '$189.00', rating: [1, 1, 1, 1, 1], image: 'assets/img/package-3.jpg', description: 'Tempor erat elitr rebum at clita.' }
  ];
}
