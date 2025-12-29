import { Button } from "@/components/ui/button";

export type FilterKey = "all" | "active" | "planned" | "completed";

type FilterChipsProps = {
  selected: FilterKey;
  onFilterChange: (filter: FilterKey) => void;
};

export function FilterChips({ selected, onFilterChange }: FilterChipsProps) {
  const items: Array<{ key: FilterKey; label: string }> = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
    { key: "planned", label: "Planned" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isSelected = item.key === selected;
        return (
          <Button
            key={item.key}
            onClick={() => onFilterChange(item.key)}
            variant={isSelected ? "default" : "outline"}
          >
            {item.label}
          </Button>
        );
      })}
    </div>
  );
}
