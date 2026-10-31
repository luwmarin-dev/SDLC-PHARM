const CATEGORIES = [
  "Crop Production",
  "Livestock",
  "Irrigation",
  "Soil Health",
  "Agribusiness",
  "Organic Farming",
  "Pest Management",
  "Climate & Weather",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_KEYS: Record<Category, string> = {
  "Crop Production": "category.cropProduction",
  Livestock: "category.livestock",
  Irrigation: "category.irrigation",
  "Soil Health": "category.soilHealth",
  Agribusiness: "category.agribusiness",
  "Organic Farming": "category.organicFarming",
  "Pest Management": "category.pestManagement",
  "Climate & Weather": "category.climateWeather",
};

export default CATEGORIES;
