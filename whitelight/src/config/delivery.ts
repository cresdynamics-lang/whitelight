import { siteConfig } from "@/config/site";

/** Delivery mode: ship to customer or collect in store */
export type DeliveryMode = "ship" | "pickup";

/** Shipping zones from store rates (KSh) */
export type DeliveryZoneId =
  | "pickup_shop"
  | "zone_e"
  | "zone_d"
  | "zone_c"
  | "parcel_outside"
  | "zone_b"
  | "zone_a";

export interface DeliveryZone {
  id: DeliveryZoneId;
  label: string;
  fee: number;
  /** Areas covered — shown under zone name */
  areas?: string;
  description?: string;
  pickupAddress?: string;
  /** Only listed under Ship; pickup is separate */
  shipOnly?: boolean;
}

export const SHOP_PICKUP_ADDRESS = `${siteConfig.contact.address}, ${siteConfig.contact.city}`;

/** Rates matching store shipping board */
export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: "pickup_shop",
    label: "Pick up at shop",
    fee: 0,
    description: `Collect at our store — ${siteConfig.contact.address}, 4th Floor, Nairobi CBD`,
    pickupAddress: SHOP_PICKUP_ADDRESS,
  },
  {
    id: "zone_e",
    label: "Nairobi Zone E",
    fee: 200,
    areas: "Riara rd, Ngong rd, Kilimani, Valley Arcade",
    shipOnly: true,
  },
  {
    id: "zone_d",
    label: "Nairobi Zone D",
    fee: 300,
    areas:
      "Lavington, Westlands, Upperhill, Naivasha Rd, Kileleshwa, Madaraka, Nairobi West, CBD",
    shipOnly: true,
  },
  {
    id: "zone_c",
    label: "Nairobi Zone C",
    fee: 450,
    areas:
      "Karen, Parklands, Spring Valley, Lower Kabete, Uthiru, Kangemi, Langata, South B & C",
    shipOnly: true,
  },
  {
    id: "parcel_outside",
    label: "Parcel Fees (Outside Nairobi Shipping)",
    fee: 500,
    areas: "Outside Nairobi — parcel / courier",
    shipOnly: true,
  },
  {
    id: "zone_b",
    label: "Nairobi Zone B",
    fee: 600,
    areas:
      "Dagoretti, Ruaka, Kitusuru, Runda, Ngong, Roysambu, Kasarani, Kiambu rd, Kahawa, Kinoo",
    shipOnly: true,
  },
  {
    id: "zone_a",
    label: "Nairobi Zone A",
    fee: 1000,
    areas: "Ruiru, Syokimau, Juja, Kitengela, Embakasi, Utawala and environs",
    shipOnly: true,
  },
];

export const SHIPPING_ZONES = DELIVERY_ZONES.filter((z) => z.shipOnly);

export function getDeliveryZone(id: string): DeliveryZone | undefined {
  return DELIVERY_ZONES.find((z) => z.id === id);
}

export function getDeliveryFee(zoneId: string): number {
  return getDeliveryZone(zoneId)?.fee ?? 0;
}

export function isShopPickup(zoneId: string): boolean {
  return zoneId === "pickup_shop";
}

export function getResolvedDeliveryAddress(
  zoneId: string,
  addressInput: string
): string {
  const zone = getDeliveryZone(zoneId);
  if (zone?.pickupAddress) return zone.pickupAddress;
  return addressInput.trim();
}

export function formatZoneFee(fee: number): string {
  if (fee === 0) return "Free";
  return `${siteConfig.currency} ${fee.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
