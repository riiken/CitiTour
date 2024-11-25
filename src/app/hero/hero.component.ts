import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent {
  searchQuery: string = '';

  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log(`Searching for: ${this.searchQuery}`);
      // Add your search logic here
    } else {
      console.warn('Search query is empty');
    }
  }
}
