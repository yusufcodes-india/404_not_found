import { describe, expect, it } from "vitest";
import { calcSession, finalCharge, quote } from "./pricing";

describe("Kilari pricing", () => {
  it("quotes energy at ₹14/kWh in integer paise", () => expect(quote(10)).toBe(14000));
  it("splits a 10 kWh session as specified", () => {
    expect(calcSession(10)).toEqual({
      grossPaise: 14000, platformFeePaise: 1400, hostEarningsPaise: 12600,
      paymentCostEstimatePaise: 350, contributionPaise: 1050
    });
  });
  it("caps final charge at prepaid amount and returns the difference", () => {
    expect(finalCharge(12, 14000)).toEqual({ chargedPaise: 14000, refundPaise: 0 });
    expect(finalCharge(8, 14000)).toEqual({ chargedPaise: 11200, refundPaise: 2800 });
  });
  it("rejects invalid quotes", () => {
    expect(() => quote(0)).toThrow();
    expect(() => quote(201)).toThrow();
  });
});