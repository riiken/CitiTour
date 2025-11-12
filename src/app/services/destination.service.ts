import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';

// Interfaces for type safety
export interface DestinationSearchResult {
  title: string;
  description: string;
  image: string;
  url: string;
  weather?: {
    temperature: number;
    description: string;
    icon: string;
  };
  source: string;
}

export interface QuickOverview {
  destination: string;
  timestamp: string;
  summary?: {
    title: string;
    description: string;
    image: string;
    url: string;
  };
  weather?: {
    temperature: number;
    description: string;
    icon: string;
  };
}

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  description: string;
  main: string;
  icon: string;
  iconUrl: string;
  windSpeed: number;
  windDirection: number;
  clouds: number;
  visibility: number;
  sunrise: string;
  sunset: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  units: string;
  source: string;
}

export interface ForecastDay {
  date: string;
  avgTemperature: number;
  minTemperature: number;
  maxTemperature: number;
  description: string;
  icon: string;
  iconUrl: string;
  humidity: number;
  precipitationProbability: number;
}

export interface DestinationImage {
  url: string;
  thumb: string;
  full: string;
  description?: string;
  photographer?: string;
  source: string;
  attribution?: string;
  width?: number;
  height?: number;
}

export interface TravelPlanningData {
  destination: string;
  overview: {
    title: string;
    description: string | null;
    heroImage: string | null;
  };
  currentConditions: {
    temperature: number;
    feelsLike: number;
    description: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  } | null;
  weatherForecast: ForecastDay[];
  recommendations: string[];
  bestTimeToVisit: {
    bestDay: string;
    score: number;
    reason: string;
    alternatives: string[];
  } | null;
  thingsToDo: string[];
  nearbyDestinations: any[];
  imageGallery: {
    url: string;
    thumb: string;
    description: string;
    photographer: string;
    attribution: string;
  }[];
  coordinates: {
    lat: number;
    lon: number;
  } | null;
  sources: string[];
  completeness: number;
  timestamp: string;
}

export interface DestinationData {
  destination: string;
  timestamp: string;
  sources: string[];
  completeness: number;
  data: {
    info?: {
      title: string;
      description: string;
      fullContent: string;
      url: string;
      image: string | null;
      coordinates: { lat: number; lon: number } | null;
      categories: string[];
      source: string;
    };
    weather?: WeatherData;
    forecast?: ForecastDay[];
    images?: DestinationImage[];
    relatedDestinations?: any[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class DestinationService {
  private apiUrl = `${environment.apiUrl}/destinations`;

  constructor(private http: HttpClient) {}

  /**
   * Search destinations
   * @param query Search query
   * @param limit Number of results (default: 5)
   */
  searchDestinations(query: string, limit: number = 5): Observable<{success: boolean, data: DestinationSearchResult[], count: number}> {
    const params = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString());

    return this.http.get<{success: boolean, data: DestinationSearchResult[], count: number}>(
      `${this.apiUrl}/search`,
      { params }
    );
  }

  /**
   * Get quick overview of destination
   * @param name Destination name
   */
  getQuickOverview(name: string): Observable<{success: boolean, data: QuickOverview}> {
    return this.http.get<{success: boolean, data: QuickOverview}>(
      `${this.apiUrl}/${encodeURIComponent(name)}/quick`
    );
  }

  /**
   * Get comprehensive destination data
   * @param name Destination name
   * @param options Query options
   */
  getDestination(
    name: string,
    options: {
      includeWeather?: boolean;
      includeImages?: boolean;
      includeForecast?: boolean;
      includeRelated?: boolean;
      units?: 'metric' | 'imperial';
    } = {}
  ): Observable<{success: boolean, data: DestinationData}> {
    let params = new HttpParams();

    if (options.includeWeather !== undefined) {
      params = params.set('includeWeather', options.includeWeather.toString());
    }
    if (options.includeImages !== undefined) {
      params = params.set('includeImages', options.includeImages.toString());
    }
    if (options.includeForecast !== undefined) {
      params = params.set('includeForecast', options.includeForecast.toString());
    }
    if (options.includeRelated !== undefined) {
      params = params.set('includeRelated', options.includeRelated.toString());
    }
    if (options.units) {
      params = params.set('units', options.units);
    }

    return this.http.get<{success: boolean, data: DestinationData}>(
      `${this.apiUrl}/${encodeURIComponent(name)}`,
      { params }
    );
  }

  /**
   * Get travel planning data with recommendations
   * @param name Destination name
   * @param units Temperature units
   */
  getTravelPlanningData(
    name: string,
    units: 'metric' | 'imperial' = 'metric'
  ): Observable<{success: boolean, data: TravelPlanningData}> {
    const params = new HttpParams().set('units', units);

    return this.http.get<{success: boolean, data: TravelPlanningData}>(
      `${this.apiUrl}/${encodeURIComponent(name)}/travel`,
      { params }
    );
  }

  /**
   * Get destination images
   * @param name Destination name
   * @param count Number of images
   */
  getDestinationImages(
    name: string,
    count: number = 10
  ): Observable<{success: boolean, data: DestinationImage[], count: number}> {
    const params = new HttpParams().set('count', count.toString());

    return this.http.get<{success: boolean, data: DestinationImage[], count: number}>(
      `${this.apiUrl}/${encodeURIComponent(name)}/images`,
      { params }
    );
  }

  /**
   * Get current weather for destination
   * @param name Destination name
   * @param units Temperature units
   */
  getWeather(
    name: string,
    units: 'metric' | 'imperial' = 'metric'
  ): Observable<{success: boolean, data: WeatherData}> {
    const params = new HttpParams().set('units', units);

    return this.http.get<{success: boolean, data: WeatherData}>(
      `${this.apiUrl}/${encodeURIComponent(name)}/weather`,
      { params }
    );
  }

  /**
   * Get weather forecast for destination
   * @param name Destination name
   * @param units Temperature units
   */
  getForecast(
    name: string,
    units: 'metric' | 'imperial' = 'metric'
  ): Observable<{success: boolean, data: ForecastDay[], city: string, country: string}> {
    const params = new HttpParams().set('units', units);

    return this.http.get<{success: boolean, data: ForecastDay[], city: string, country: string}>(
      `${this.apiUrl}/${encodeURIComponent(name)}/forecast`,
      { params }
    );
  }

  /**
   * Get Wikipedia info for destination
   * @param name Destination name
   */
  getDestinationInfo(name: string): Observable<{success: boolean, data: any}> {
    return this.http.get<{success: boolean, data: any}>(
      `${this.apiUrl}/${encodeURIComponent(name)}/info`
    );
  }
}
