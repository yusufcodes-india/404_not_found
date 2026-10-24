import { flags } from '../flags';

export interface MeterAdapter {
  readStart(chargerId: string): Promise<number>;
  readEnd(chargerId: string): Promise<number>;
  liveKwh?(bookingId: string): Promise<number>;
}

class MockMeterAdapter implements MeterAdapter {
  async readStart(chargerId: string) {
    return Math.random() * 1000;
  }

  async readEnd(chargerId: string) {
    return Math.random() * 2000;
  }

  async liveKwh(bookingId: string) {
    return Math.random() * 50;
  }
}

class SmartSocketAdapter implements MeterAdapter {
  async readStart() { throw new Error('SmartSocket not configured'); }
  async readEnd() { throw new Error('SmartSocket not configured'); }
  async liveKwh() { throw new Error('SmartSocket not configured'); }
}

export function getMeterAdapter(): MeterAdapter {
  return flags.useMockMeter ? new MockMeterAdapter() : new SmartSocketAdapter();
}
