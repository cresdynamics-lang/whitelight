import { siteConfig } from "@/config/site";

/** Nairobi delivery zones and fees (KSh) */
export type DeliveryZoneId =
  | "pickup_shop"
  | "cbd"
  | "westlands"
  | "upperhill"
  | "outside_nairobi";

export interface DeliveryZone {
  id: DeliveryZoneId;
  label: string;
  fee: number;
  description?: string;
  /** Full address when customer collects in-store */
  pickupAddress?: string;
}

/** In-store collection — same as site contact address */
export const SHOP_PICKUP_ADDRESS = `${siteConfig.contact.address}, ${siteConfig.contact.city}`;

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: "pickup_shop",
    label: "Pick up at shop",
    fee: 0,
    description: `Collect at our store — ${siteConfig.contact.address}, 4th Floor, Nairobi CBD`,
    pickupAddress: SHOP_PICKUP_ADDRESS,
  },
  {
    id: "cbd",
    label: "Nairobi CBD (delivery)",
    fee: 0,
    description: "Free delivery within CBD",
  },
  {
    id: "westlands",
    label: "Westlands",
    fee: 300,
  },
  {
    id: "upperhill",
    label: "Upperhill",
    fee: 250,
  },
  {
    id: "outside_nairobi",
    label: "Outside Nairobi",
    fee: 300,
    description: "Delivery to other towns / counties",
  },
];

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
