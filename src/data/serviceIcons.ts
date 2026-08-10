import { Bug, SprayCan, Droplets, Wind, Waves, Rat, Bird, Skull, Sprout, FlaskConical, Sparkles, type LucideIcon } from "lucide-react";

// Иконки услуг вынесены отдельно: данные лоадера должны быть сериализуемыми
// (компоненты-иконки нельзя передавать через dehydrate маршрутизатора).
export const SERVICE_ICONS: Record<string, LucideIcon> = {
  "unichtozhenie-klopov": Bug,
  "unichtozhenie-tarakanov": Bug,
  "obrabotka-uchastkov": Sprout,
  "obrabotka-ot-pleseni": Droplets,
  "ozonirovanie-pomescheniy": Wind,
  "sushka-posle-zatopleniya": Waves,
  "dezinfekciya": SprayCan,
  "deratizaciya": Rat,
  "unichtozhenie-blokh": Bug,
  "unichtozhenie-os": Bird,
  "unichtozhenie-borschevika": Skull,
  "fumigaciya": FlaskConical,
  "dezodoraciya": Sparkles,
};

export const getServiceIcon = (slug: string): LucideIcon => SERVICE_ICONS[slug] ?? Bug;
