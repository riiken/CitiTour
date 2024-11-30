import { Component } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent {

  isLoading = false;  // Controls the visibility of the loader
  currentMessage = 'Exploring the Best Locations...';  // Initial loading message
  private messages = [
    'Exploring the Best Locations...',
    'Finding Hidden Gems...',
    'Curating Amazing Tours...',
    'Your Next Adventure Awaits...'
  ];
  private messageIndex = 0;
  private intervalId: any;

  constructor(private loaderService: LoaderService) {
    // Subscribe to loading status from the LoaderService
    this.loaderService.loading$.subscribe((loading) => {
      this.isLoading = loading;
      this.startMessageRotation();
    });
  }

  ngOnDestroy() {
    // Clear the interval when the component is destroyed
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Start the message rotation
  private startMessageRotation() {
    console.log("object");
    this.intervalId = setInterval(() => {
      this.messageIndex = (this.messageIndex + 1) % this.messages.length;
      this.currentMessage = this.messages[this.messageIndex];
    }, 5000);
  }
}
