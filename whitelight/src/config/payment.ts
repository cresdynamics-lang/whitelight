/** M-Pesa Paybill payment details (business number + account). */
export const MPESA_PAYMENT = {
  methodId: "mpesa_paybill" as const,
  methodLabel: "M-Pesa Paybill",
  /** Lipa na M-Pesa → Pay Bill → Business number */
  paybillNumber: "247247",
  /** Account number under the paybill */
  accountNumber: "0708749473",
  paybillNote: "Pay via M-Pesa Paybill 247247. Use Account 0708749473.",
  accountName: "WHITELIGHT STORE",
} as const;

export const MPESA_PAYMENT_STEPS = [
  "Open M-Pesa on your phone",
  "Select Lipa na M-Pesa",
  "Choose Pay Bill",
  `Enter Business Number: ${MPESA_PAYMENT.paybillNumber}`,
  `Enter Account Number: ${MPESA_PAYMENT.accountNumber}`,
  "Enter the exact order total shown below",
  "Enter your M-Pesa PIN and confirm",
  "Save the M-Pesa confirmation message (optional: enter the code below)",
] as const;
