import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatInr(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function formatSpend(min?: number | null, max?: number | null) {
  if (min == null && max == null) return "₹₹";
  if (min != null && max != null && min !== max) {
    return `${formatInr(min)} – ${formatInr(max)}`;
  }
  return formatInr(min ?? max ?? 0);
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours} hr${hours === 1 ? "" : "s"}`;
  return `${hours.toFixed(1).replace(/\.0$/, "")} hrs`;
}

export function priceBandLabel(band?: string | null, min?: number | null, max?: number | null) {
  if (band) return band;
  const high = max ?? min ?? 0;
  if (high <= 400) return "₹";
  if (high <= 1500) return "₹₹";
  if (high <= 3500) return "₹₹₹";
  return "₹₹₹₹";
}
