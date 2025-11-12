import { Component, Input } from '@angular/core';
import { WeatherData, ForecastDay } from '../../services/destination.service';

@Component({
  selector: 'app-weather-display',
  templateUrl: './weather-display.component.html',
  styleUrls: ['./weather-display.component.css']
})
export class WeatherDisplayComponent {
  @Input() weather: WeatherData | null = null;
  @Input() forecast: ForecastDay[] = [];
  @Input() loading: boolean = false;

  /**
   * Get full weather icon URL from icon code
   */
  getWeatherIcon(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }

  /**
   * Get day name from date string
   */
  getDayName(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  /**
   * Get formatted date (e.g., "Nov 12")
   */
  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  /**
   * Get wind direction from degrees
   */
  getWindDirection(degrees: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  /**
   * Get precipitation level description
   */
  getPrecipitationLevel(probability: number): string {
    if (probability < 20) return 'Low';
    if (probability < 50) return 'Moderate';
    if (probability < 70) return 'High';
    return 'Very High';
  }

  /**
   * Get temperature color class based on value
   */
  getTempColorClass(temp: number): string {
    if (temp < 0) return 'temp-freezing';
    if (temp < 10) return 'temp-cold';
    if (temp < 20) return 'temp-cool';
    if (temp < 30) return 'temp-warm';
    return 'temp-hot';
  }
}
