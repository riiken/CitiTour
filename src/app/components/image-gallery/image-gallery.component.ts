import { Component, Input, OnInit } from '@angular/core';
import { DestinationImage } from '../../services/destination.service';

@Component({
    selector: 'app-image-gallery',
    templateUrl: './image-gallery.component.html',
    styleUrls: ['./image-gallery.component.css'],
    standalone: false
})
export class ImageGalleryComponent implements OnInit {
  @Input() images: DestinationImage[] = [];
  @Input() loading: boolean = false;
  @Input() destination: string = '';

  // Lightbox state
  lightboxVisible: boolean = false;
  currentImageIndex: number = 0;
  currentImage: DestinationImage | null = null;

  ngOnInit(): void {
    // Initialize component
  }

  /**
   * Open lightbox with specific image
   */
  openLightbox(index: number): void {
    if (this.images && this.images.length > 0 && index >= 0 && index < this.images.length) {
      this.currentImageIndex = index;
      this.currentImage = this.images[index];
      this.lightboxVisible = true;

      // Prevent body scroll when lightbox is open
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Close lightbox
   */
  closeLightbox(): void {
    this.lightboxVisible = false;
    this.currentImage = null;

    // Restore body scroll
    document.body.style.overflow = 'auto';
  }

  /**
   * Navigate to next image
   */
  nextImage(): void {
    if (this.images && this.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
      this.currentImage = this.images[this.currentImageIndex];
    }
  }

  /**
   * Navigate to previous image
   */
  previousImage(): void {
    if (this.images && this.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
      this.currentImage = this.images[this.currentImageIndex];
    }
  }

  /**
   * Handle keyboard navigation
   */
  onKeyDown(event: KeyboardEvent): void {
    if (!this.lightboxVisible) return;

    switch (event.key) {
      case 'ArrowRight':
        this.nextImage();
        break;
      case 'ArrowLeft':
        this.previousImage();
        break;
      case 'Escape':
        this.closeLightbox();
        break;
    }
  }

  /**
   * Get image counter text (e.g., "3 / 10")
   */
  getImageCounter(): string {
    return `${this.currentImageIndex + 1} / ${this.images.length}`;
  }

  /**
   * Get fallback image URL
   */
  getImageUrl(image: DestinationImage): string {
    return image.url || image.thumb || 'assets/images/placeholder.jpg';
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(image: DestinationImage): string {
    return image.thumb || image.url || 'assets/images/placeholder.jpg';
  }

  /**
   * Handle image loading error
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.jpg';
  }

  /**
   * Get photographer credit
   */
  getPhotographerCredit(image: DestinationImage): string {
    if (image.photographer && image.source) {
      return `Photo by ${image.photographer} on ${image.source}`;
    } else if (image.photographer) {
      return `Photo by ${image.photographer}`;
    } else if (image.source) {
      return `Source: ${image.source}`;
    }
    return '';
  }

  /**
   * Track by function for *ngFor optimization
   */
  trackByIndex(index: number, item: DestinationImage): number {
    return index;
  }
}
