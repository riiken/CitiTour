import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class LoaderComponent implements OnDestroy {
  isLoading = false;
  currentMessage = 'Exploring the Best Locations...';
  private messages = [
    'Exploring the Best Locations...',
    'Finding Hidden Gems...',
    'Curating Amazing Tours...',
    'Your Next Adventure Awaits...'
  ];
  private messageIndex = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private subscription: Subscription;

  constructor(private loaderService: LoaderService) {
    this.subscription = this.loaderService.loading$.subscribe((loading) => {
      this.isLoading = loading;
      loading ? this.startMessageRotation() : this.stopMessageRotation();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.stopMessageRotation();
  }

  private startMessageRotation(): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      this.messageIndex = (this.messageIndex + 1) % this.messages.length;
      this.currentMessage = this.messages[this.messageIndex];
    }, 5000);
  }

  private stopMessageRotation(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
