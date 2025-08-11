import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to get user-friendly tournament status text
export function getTournamentStatusText(status: string): string {
  switch (status) {
    case "submission_period":
      return "Submission Period"
    case "open":
      return "Open"
    case "closed":
      return "Closed"
    case "coming_soon":
      return "Coming Soon"
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

export function getAgeRangeFromCategory(ageCategory: string): string {
  switch (ageCategory) {
    case "5-12":
      return "between 5-12 years of age";
    case "13-20":
      return "between 13-20 years of age";
    case "21-34":
      return "between 21-34 years of age";
    case "35+":
      return "35 years of age or older";
    default:
      return "at least 16 years of age"; // fallback for unknown categories
  }
}

export function getCategoryLabels(categories: string[]): string {
  const categoryOptions = [
    { value: "photography", label: "Photography" },
    { value: "illustration", label: "Illustration" },
    { value: "3d-modeling", label: "3D Modeling" },
    { value: "painting", label: "Painting" },
    { value: "sculpture", label: "Sculpture" },
    { value: "drawing", label: "Drawing" },
    { value: "print-making-art", label: "Print Making Art" },
    { value: "other", label: "Other" },
  ];
  
  if (!categories || categories.length === 0) {
    return "All categories";
  }
  
  return categories
    .map((cat) => categoryOptions.find((o) => o.value === cat)?.label || cat)
    .join(", ");
}

// Function to calculate discounted price
export function calculateDiscountedPrice(originalPrice: number, discountPercent: number): number {
  if (!discountPercent || discountPercent <= 0) return originalPrice;
  const discount = (originalPrice * discountPercent) / 100;
  const discountedPrice = Math.max(0, originalPrice - discount);
  return Math.round(discountedPrice); // Round to nearest integer
}

// Function to format price with discount display
export function formatPriceWithDiscount(originalPrice: number, discountPercent?: number): {
  originalPrice: string;
  discountedPrice: string;
  hasDiscount: boolean;
  discountAmount: string;
} {
  if (!discountPercent || discountPercent <= 0) {
    return {
      originalPrice: `₹${originalPrice}`,
      discountedPrice: `₹${originalPrice}`,
      hasDiscount: false,
      discountAmount: "₹0"
    };
  }

  const discountedPrice = calculateDiscountedPrice(originalPrice, discountPercent);
  const discountAmount = originalPrice - discountedPrice;

  return {
    originalPrice: `₹${originalPrice}`,
    discountedPrice: `₹${discountedPrice}`,
    hasDiscount: true,
    discountAmount: `₹${discountAmount}`
  };
}
