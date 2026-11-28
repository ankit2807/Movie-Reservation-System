import type { IFoodLine, IReservationAmounts, ISeatDetail } from "../models/movieReservationModel";

export const CONVENIENCE_FEE_PER_TICKET = 30; // base fee per ticket (₹)
export const GST_RATE = 0.18; // GST on convenience fee
export const CANCELLATION_CUTOFF_MS = 20 * 60 * 1000; // cancellations allowed until 20 min before show

export interface SeatTierConfig {
  tier: string;
  price: number;
  maxCol: number;
}

export interface FoodCatalogItem {
  name: string;
  price: number;
}

// Authoritative server-side auditorium seat tier pricing (prevents client price tampering)
export const SERVER_SEAT_TIERS: Record<string, SeatTierConfig> = {
  A: { tier: "MAX RECLINER", price: 1400, maxCol: 15 },
  B: { tier: "EXECUTIVE", price: 520, maxCol: 17 },
  C: { tier: "EXECUTIVE", price: 520, maxCol: 17 },
  D: { tier: "EXECUTIVE", price: 520, maxCol: 17 },
  E: { tier: "PRIME", price: 520, maxCol: 16 },
  F: { tier: "PRIME", price: 520, maxCol: 16 },
  G: { tier: "PRIME", price: 520, maxCol: 16 },
  H: { tier: "PRIME", price: 520, maxCol: 16 },
  I: { tier: "PRIME", price: 520, maxCol: 16 },
  J: { tier: "PRIME", price: 520, maxCol: 16 },
  K: { tier: "CLUB", price: 500, maxCol: 16 },
  L: { tier: "CLUB", price: 500, maxCol: 16 },
};

// Authoritative server-side F&B catalog pricing (prevents client price tampering)
export const SERVER_FOOD_CATALOG: Record<string, FoodCatalogItem> = {
  "combo-couple": { name: "Couple Popcorn + 2 Pepsi Combo", price: 490 },
  "popcorn-caramel": { name: "Large Caramel & Cheese Gourmet Tub", price: 340 },
  "nachos-cheese": { name: "Loaded Jalapeño Nachos with Dip", price: 290 },
  "pepsi-large": { name: "Chilled Pepsi / Pepsi Black (450ml)", price: 180 },
  "cold-coffee": { name: "Signature Iced Cold Coffee Frappe", price: 220 },
  "paneer-hotdog": { name: "Smoky Paneer Tikka Roll / Hotdog", price: 260 },
};

export const round2 = (n: number): number => Math.round(n * 100) / 100;

export const computePromoDiscount = (
  promoCode: string | undefined,
  ticketsAmount: number,
  foodAmount: number
): number => {
  const code = String(promoCode || "").trim().toUpperCase();
  if (code === "FIRSTSHOW") return Math.min(150, Math.round(ticketsAmount * 0.15));
  if (code === "PAYTM150") return ticketsAmount >= 300 ? 150 : ticketsAmount > 0 ? 75 : 0;
  if (code === "RUPAY25") return Math.min(120, Math.round((ticketsAmount + foodAmount) * 0.2));
  return 0;
};

export const parseShowDateTime = (
  showDate?: string,
  showTime?: string,
  fallbackDateTime?: string | Date
): Date => {
  if (fallbackDateTime) {
    const d = new Date(fallbackDateTime);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const datePart = /^\d{4}-\d{2}-\d{2}$/.test(String(showDate || ""))
    ? String(showDate)
    : new Date().toISOString().split("T")[0];
  if (!showTime) return new Date(datePart);

  const match12 = String(showTime).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const mins = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    const hh = String(hours).padStart(2, "0");
    const mm = String(mins).padStart(2, "0");
    const d = new Date(`${datePart}T${hh}:${mm}:00`);
    if (!Number.isNaN(d.getTime())) return d;
  }

  const match24 = String(showTime).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hh = String(match24[1]).padStart(2, "0");
    const mm = String(match24[2]).padStart(2, "0");
    const d = new Date(`${datePart}T${hh}:${mm}:00`);
    if (!Number.isNaN(d.getTime())) return d;
  }

  const fallback = new Date(datePart);
  return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
};

export interface ShowKeyPricingInput {
  showKey?: unknown;
  showDate?: unknown;
  showTime?: unknown;
  showDateTime?: string | Date;
  theatre?: { id?: unknown; name?: unknown; address?: unknown; screen?: unknown };
  seatDetails?: Array<{ seat?: unknown; tier?: unknown; price?: unknown }>;
  food?: Array<{ id?: unknown; qty?: unknown }>;
  promoCode?: unknown;
}

export type ShowKeyPricingResult =
  | { error: string }
  | {
      error?: undefined;
      cleanShowKey: string;
      uniqueSeats: string[];
      verifiedSeatDetails: ISeatDetail[];
      verifiedFoodLines: IFoodLine[];
      cleanPromo: string | undefined;
      showAt: Date;
      amounts: IReservationAmounts;
      amountInPaise: number;
    };

/**
 * Validates showKey payload, auditorium seats, F&B items, and promo code,
 * returning authoritative server-calculated INR pricing.
 */
export const validateAndPriceShowKeyBooking = (
  body: ShowKeyPricingInput = {}
): ShowKeyPricingResult => {
  const { showKey, showDate, showTime, showDateTime, theatre, seatDetails, food, promoCode } = body;

  const cleanShowKey = String(showKey || "").trim();
  if (!cleanShowKey || cleanShowKey.length > 200) {
    return { error: "Valid showKey is required" };
  }

  const rawSeatLines = Array.isArray(seatDetails) ? seatDetails : [];
  const uniqueSeats = [
    ...new Set(
      rawSeatLines
        .map((s) => String(s?.seat || "").trim().toUpperCase())
        .filter(Boolean)
    ),
  ];

  if (!uniqueSeats.length || uniqueSeats.length > 10) {
    return { error: "Select between 1 and 10 unique seats" };
  }
  if (!showDate || !showTime || !theatre?.name) {
    return { error: "Show details are incomplete" };
  }

  const verifiedSeatDetails: ISeatDetail[] = [];
  for (const seatId of uniqueSeats) {
    const match = seatId.match(/^([A-L])(\d{1,2})$/);
    if (!match) {
      return { error: `Invalid seat identifier: ${seatId}` };
    }
    const row = match[1];
    const col = parseInt(match[2], 10);
    const tierInfo = SERVER_SEAT_TIERS[row];
    if (!tierInfo || col < 1 || col > tierInfo.maxCol) {
      return { error: `Seat ${seatId} is out of auditorium bounds` };
    }
    verifiedSeatDetails.push({
      seat: seatId,
      tier: tierInfo.tier,
      price: tierInfo.price,
    });
  }

  const verifiedFoodLines: IFoodLine[] = [];
  for (const f of Array.isArray(food) ? food : []) {
    const itemId = String(f?.id || "").trim();
    const qty = Math.floor(Number(f?.qty) || 0);
    const catalogItem = SERVER_FOOD_CATALOG[itemId];
    if (catalogItem && qty > 0 && qty <= 20) {
      verifiedFoodLines.push({
        id: itemId,
        name: catalogItem.name,
        qty,
        price: catalogItem.price,
      });
    }
  }

  const ticketsAmount = verifiedSeatDetails.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = CONVENIENCE_FEE_PER_TICKET * uniqueSeats.length;
  const gst = round2(convenienceFee * GST_RATE);
  const foodAmount = verifiedFoodLines.reduce((sum, f) => sum + f.qty * f.price, 0);
  const cleanPromo = promoCode ? String(promoCode).trim().toUpperCase() : undefined;
  const discount = computePromoDiscount(cleanPromo, ticketsAmount, foodAmount);
  const total = Math.max(0, round2(ticketsAmount + convenienceFee + gst + foodAmount - discount));
  const amountInPaise = Math.round(total * 100);
  const showAt = parseShowDateTime(String(showDate), String(showTime), showDateTime);

  return {
    cleanShowKey,
    uniqueSeats,
    verifiedSeatDetails,
    verifiedFoodLines,
    cleanPromo: discount > 0 ? cleanPromo : undefined,
    showAt,
    amounts: {
      tickets: ticketsAmount,
      convenienceFee,
      gst,
      food: foodAmount,
      discount,
      total,
    },
    amountInPaise,
  };
};
