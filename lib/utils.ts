import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
