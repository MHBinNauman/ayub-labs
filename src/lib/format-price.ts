/** Price formatting. No site-data imports, so client islands can use it. */

const pkrFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

/** 1500 → "Rs 1,500". */
export function formatPKR(amount: number): string {
  return pkrFormatter.format(amount);
}
