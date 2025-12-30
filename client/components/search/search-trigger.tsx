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
      className="h-9 w-9 justify-center gap-2 bg-muted/50 px-0 font-normal text-muted-foreground hover:bg-muted sm:w-full sm:max-w-xs sm:justify-start sm:px-3"
      onClick={onOpenSearch}
      type="button"
      variant="ghost"
    >
      <Search className="size-4 shrink-0" />
      <span className="hidden flex-1 text-left sm:inline">Search</span>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] text-muted-foreground opacity-100 sm:flex">
        <span className="text-xs">{isMac ? "⌘" : "Ctrl"}</span>K
      </kbd>
    </Button>
  );
}
