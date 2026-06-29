// WhatsApp integration utility
import { siteConfig } from "@/config/site";

export interface WhatsAppMessageParams {
  productName: string;
  productPrice: number;
  imageUrl?: string;
  productUrl?: string;
  currency?: string;
  quantity?: number;
  sizeLabel?: string;
}

export interface WhatsAppCustomerDetails {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  deliveryLocation?: string;
  deliveryFee?: number;
  paymentMethod?: string;
  mpesaCode?: string;
  notes?: string;
  orderNumber?: string;
}

export interface WhatsAppCartOrderItem {
  name: string;
  unitPrice: number;
  quantity: number;
  sizeLabel?: string;
  referenceLink?: string;
  imageUrl?: string;
}

/**
 * Generate a WhatsApp message URL with product details
 * @param params Product details to include in the message
 * @returns WhatsApp link
 */
export function generateWhatsAppMessage(params: WhatsAppMessageParams): string {
  const {
    productName,
    productPrice,
    imageUrl,
    productUrl,
    currency = siteConfig.currency,
    quantity = 1,
    sizeLabel,
  } = params;

  // Create message with product details
  const message = `Hi! I'm interested in ordering:

📦 *Product:* ${productName}
💰 *Price:* ${currency} ${productPrice.toLocaleString()}
${sizeLabel ? `👟 *Size(s):* ${sizeLabel}\n` : ""}📊 *Quantity:* ${quantity}
${productUrl ? `🔗 *Product Page:* ${productUrl}` : ""}
${imageUrl ? `🖼️ *Image Link:* ${imageUrl}` : ""}

Please confirm availability and delivery details. Thank you!`;

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);

  // WhatsApp number without + symbol for API
  const whatsappNumber = siteConfig.contact.whatsapp.replace(/[^0-9]/g, "");

  // Return WhatsApp API URL
  return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
}

/**
 * Open WhatsApp with pre-filled product order message
 * @param params Product details
 */
export function openWhatsAppOrderMessage(params: WhatsAppMessageParams): void {
  const url = generateWhatsAppMessage(params);
  window.open(url, "_blank", "noopener,noreferrer");
}

export function generateWhatsAppCartOrderMessage(params: {
  customer: WhatsAppCustomerDetails;
  items: WhatsAppCartOrderItem[];
  currency?: string;
  subtotal?: number;
  deliveryFee?: number;
  total?: number;
}): string {
  const { customer, items, currency = siteConfig.currency, subtotal, deliveryFee, total } = params;

  const header = customer.orderNumber
    ? `NEW ORDER #${customer.orderNumber}`
    : `NEW ORDER`;

  const customerLines = [
    `CUSTOMER DETAILS:`,
    `Name: ${customer.name}`,
    `Phone: ${customer.phone}`,
    customer.email ? `Email: ${customer.email}` : null,
    customer.deliveryLocation ? `Location: ${customer.deliveryLocation}` : null,
    customer.address ? `Address: ${customer.address}` : null,
    customer.paymentMethod ? `Payment: ${customer.paymentMethod}` : null,
    customer.mpesaCode ? `M-Pesa Code: ${customer.mpesaCode}` : null,
  ].filter(Boolean);

  const itemLines = items.flatMap((item, idx) => {
    const line1 = `${idx + 1}. ${item.name}`;
    const line2Parts = [
      item.sizeLabel ? `Size: ${item.sizeLabel}` : null,
      `Qty: ${item.quantity}`,
      `${currency} ${(item.unitPrice * item.quantity).toLocaleString()}`,
    ].filter(Boolean);
    const line2 = `   ${line2Parts.join(" | ")}`;

    const refs = [
      item.referenceLink ? `   Ref: ${item.referenceLink}` : null,
      item.imageUrl ? `   Image: ${item.imageUrl}` : null,
    ].filter(Boolean) as string[];

    return [line1, line2, ...refs];
  });

  const subtotalLine =
    typeof subtotal === "number"
      ? `Subtotal: ${currency} ${subtotal.toLocaleString()}`
      : null;
  const deliveryLine =
    typeof deliveryFee === "number"
      ? `Delivery: ${deliveryFee === 0 ? "Free" : `${currency} ${deliveryFee.toLocaleString()}`}`
      : null;
  const totalLine =
    typeof total === "number" ? `TOTAL: ${currency} ${total.toLocaleString()}` : null;

  const notesLine = customer.notes ? `NOTES: ${customer.notes}` : null;

  const message = [
    header,
    "",
    ...customerLines,
    "",
    "ORDER ITEMS:",
    ...itemLines,
    "",
    subtotalLine,
    deliveryLine,
    totalLine,
    "",
    notesLine,
  ]
    .filter((l) => l != null && String(l).trim().length > 0)
    .join("\n");

  const encodedMessage = encodeURIComponent(message);
  const whatsappNumber = siteConfig.contact.whatsapp.replace(/[^0-9]/g, "");
  return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
}

export function openWhatsAppCartOrderMessage(params: {
  customer: WhatsAppCustomerDetails;
  items: WhatsAppCartOrderItem[];
  currency?: string;
  subtotal?: number;
  deliveryFee?: number;
  total?: number;
}): void {
  const url = generateWhatsAppCartOrderMessage(params);
  window.open(url, "_blank", "noopener,noreferrer");
}
