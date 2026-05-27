import { ClothingCategory } from "../types/closet";
import { MagicalCategoryOrb } from "./MagicalCategoryOrb";

export type OrbCategory = ClothingCategory;

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
    category: "dress",
    label: "Dress",
    position: { top: "20%", right: "4%" }
  },
  {
    category: "tops",
    label: "Tops",
    position: { top: "36%", right: "4%" }
  },
  {
    category: "bottoms",
    label: "Bottoms",
    position: { top: "58%", left: "5%" }
  },
  {
    category: "shoes",
    label: "Shoes",
    position: { bottom: "8%", right: "7%" }
  },
  {
    category: "jacket",
    label: "Jacket",
    position: { top: "42%", left: "4%" }
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
          onPress={onCategorySelect}
        />
      ))}
    </>
  );
}
