import { describe, it, expect } from 'vitest';
import { MapsAdapter } from '@/lib/adapters/maps';

describe('MapsAdapter', () => {
  it('returns valid map configuration with Geoapify provider', () => {
    const config = MapsAdapter.getConfig();
    expect(config.provider).toBe('geoapify');
    expect(config.apiKey).toBe('a3b6cbc4ec4248a49338566cc87eaa60');
    expect(config.tileUrl).toContain('maps.geoapify.com/v1/tile/osm-bright');
    expect(config.iconUrl).toContain('api.geoapify.com/v1/icon');
    expect(config.defaultCenter.lat).toBe(18.5590);
    expect(config.defaultCenter.lng).toBe(73.7868);
  });

  it('calculates driving route distance with valid km and minutes', async () => {
    // Pune coordinates: Green Hive (18.5590, 73.7868) to Skyline Residency (18.5670, 73.8010)
    const route = await MapsAdapter.calculateRoute(18.5590, 73.7868, 18.5670, 73.8010);
    expect(route).toBeDefined();
    expect(typeof route.distanceMeters).toBe('number');
    expect(typeof route.distanceKm).toBe('string');
    expect(route.timeMinutes).toBeGreaterThan(0);
    expect(Array.isArray(route.coordinates)).toBe(true);
  });
});
