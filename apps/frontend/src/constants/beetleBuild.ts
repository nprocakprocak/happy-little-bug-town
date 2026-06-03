export const BEETLE_BUILDING_OPTIONS = Array.from({ length: 5 }, () => ({
  name: "Beetle house",
  imageSrc: "/structures/beetle-house.webp",
}));

export const BEETLE_BUILD_RESOURCE_COSTS = [
  { itemType: "leaf_part" as const, count: 20 },
  { itemType: "little_rock" as const, count: 15 },
  { itemType: "stick" as const, count: 10 },
];
