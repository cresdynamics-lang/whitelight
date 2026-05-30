import { siteConfig } from "@/config/site";

/** M-Pesa till / paybill — update when business paybill is live */
export const MPESA_PAYMENT = {
  methodId: "mpesa_paybill" as const,
  methodLabel: "M-Pesa Paybill (Till)",
  /** Lipa na M-Pesa → Buy Goods till number */
  tillNumber: siteConfig.contact.tillNumber,
  /** Shown in UI until business paybill is configured */
  paybillNote:
    "We use M-Pesa Till for now. Business Paybill details will be added soon.",
  accountName: siteConfig.name,
} as const;

export const MPESA_PAYMENT_STEPS = [
  "Open M-Pesa on your phone",
  "Select Lipa na M-Pesa",
  "Choose Buy Goods and Services",
  `Enter Till Number: ${MPESA_PAYMENT.tillNumber}`,
  "Enter the exact order total shown below",
  "Enter your M-Pesa PIN and confirm",
  "Save the M-Pesa confirmation message (optional: enter the code below)",
] as const;
