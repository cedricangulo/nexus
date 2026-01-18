"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type SearchTriggerProps = {
  onOpenSearch: () => void;
};

export function SearchTrigger({ onOpenSearch }: SearchTriggerProps) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  return (
    <Button
      className="h-9 w-9 justify-center sm:w-full sm:max-w-xs sm:justify-start"
      onClick={onOpenSearch}
      type="button"
      variant="outline"
    >
      <Search className="shrink-0" />
      <span className="hidden flex-1 text-left sm:inline">Search</span>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] text-muted-foreground opacity-100 sm:flex">
        <span className="text-xs">{isMac ? "⌘" : "Ctrl"}</span>K
      </kbd>
    </Button>
  );
}
