export interface MapConfig {
  provider: 'geoapify' | 'google' | 'mock';
  apiKey: string;
  tileUrl: string;
  iconUrl: string;
  defaultCenter: {
    lat: number;
    lng: number;
  };
  defaultZoom: number;
}

export interface RouteResult {
  distanceMeters: number;
  distanceKm: string;
  timeSeconds: number;
  timeMinutes: number;
  coordinates: [number, number][];
}

export class MapsAdapter {
  static getApiKey(): string {
    return (
      process.env.GEOAPIFY_API_KEY ||
      process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ||
      process.env.MAPS_API_KEY ||
      'a3b6cbc4ec4248a49338566cc87eaa60'
    );
  }

  static getProvider(): 'geoapify' | 'google' | 'mock' {
    const p = (process.env.MAPS_PROVIDER || 'geoapify').toLowerCase();
    if (p === 'google') return 'google';
    if (p === 'mock') return 'mock';
    return 'geoapify';
  }

  static getConfig(): MapConfig {
    const apiKey = this.getApiKey();
    const provider = this.getProvider();

    return {
      provider,
      apiKey,
      tileUrl: `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}{r}.png?apiKey=${apiKey}`,
      iconUrl: `https://api.geoapify.com/v1/icon/?type=awesome&color=%23174c3a&icon=bolt&iconType=awesome&apiKey=${apiKey}`,
      defaultCenter: {
        lat: 18.5590, // Pune center
        lng: 73.7868,
      },
      defaultZoom: 13,
    };
  }

  static async reverseGeocode(lat: number, lng: number): Promise<string> {
    const apiKey = this.getApiKey();
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${apiKey}`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) throw new Error(`Geocoding HTTP error ${res.status}`);
      const data = await res.json();
      const feature = data.features?.[0];
      return feature?.properties?.formatted || `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  static async calculateRoute(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number
  ): Promise<RouteResult> {
    const apiKey = this.getApiKey();
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/routing?waypoints=${fromLat},${fromLng}|${toLat},${toLng}&mode=drive&apiKey=${apiKey}`,
        { next: { revalidate: 300 } }
      );
      if (!res.ok) throw new Error(`Routing HTTP error ${res.status}`);
      const data = await res.json();
      const feature = data.features?.[0];
      const props = feature?.properties || {};
      const distanceMeters = props.distance || 5000;
      const timeSeconds = props.time || 600;

      return {
        distanceMeters,
        distanceKm: (distanceMeters / 1000).toFixed(1),
        timeSeconds,
        timeMinutes: Math.round(timeSeconds / 60),
        coordinates: feature?.geometry?.coordinates?.[0] || [[fromLng, fromLat], [toLng, toLat]],
      };
    } catch {
      // Approximate fallback
      const roughKm = Math.sqrt(Math.pow((toLat - fromLat) * 111, 2) + Math.pow((toLng - fromLng) * 105, 2));
      return {
        distanceMeters: Math.round(roughKm * 1000),
        distanceKm: roughKm.toFixed(1),
        timeSeconds: Math.round(roughKm * 120),
        timeMinutes: Math.round(roughKm * 2),
        coordinates: [[fromLng, fromLat], [toLng, toLat]],
      };
    }
  }
}
