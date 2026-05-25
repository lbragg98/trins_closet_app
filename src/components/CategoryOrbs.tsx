import { ClothingCategory } from "../types/closet";
import { MagicalCategoryOrb } from "./MagicalCategoryOrb";

export type OrbCategory = "top" | "bottom" | "shoes" | "accessory";

type CategoryOrbsProps = {
  activeCategory: OrbCategory | null;
  onCategorySelect: (category: OrbCategory) => void;
};

const orbConfig: Array<{
  category: OrbCategory;
  label: string;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
}> = [
  {
    category: "accessory",
    label: "Accessories",
    position: { top: "9%", left: "7%" }
  },
  {
    category: "top",
    label: "Tops",
    position: { top: "30%", right: "5%" }
  },
  {
    category: "bottom",
    label: "Bottoms",
    position: { top: "58%", left: "5%" }
  },
  {
    category: "shoes",
    label: "Shoes",
    position: { bottom: "8%", right: "7%" }
  }
];

export function CategoryOrbs({ activeCategory, onCategorySelect }: CategoryOrbsProps) {
  return (
    <>
      {orbConfig.map((orb) => (
        <MagicalCategoryOrb
          key={orb.category}
          category={orb.category as ClothingCategory}
          label={orb.label}
          position={orb.position}
          isActive={activeCategory === orb.category}
          onPress={(category) => onCategorySelect(category as OrbCategory)}
        />
      ))}
    </>
  );
}
