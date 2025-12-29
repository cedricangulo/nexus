"use client";

import { LoaderIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        className="m-0 p-0 text-foreground"
        size="icon"
        variant="secondary"
      >
        <LoaderIcon className="size-4 animate-spin text-foreground" />
      </Button>
    );
  }

  const isLight = theme === "light";

  return (
    <Button
      className="m-0 p-0 text-foreground"
      onClick={() => setTheme(isLight ? "dark" : "light")}
      size="icon"
      variant="secondary"
    >
      <svg
        aria-label="Toggle theme"
        className="size-4.5"
        fill="none"
        height="24"
        role="img"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Toggle theme</title>
        <path d="M0 0h24v24H0z" fill="none" stroke="none" />
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
        <path d="M12 3l0 18" />
        <path d="M12 9l4.65 -4.65" />
        <path d="M12 14.3l7.37 -7.37" />
        <path d="M12 19.6l8.85 -8.85" />
      </svg>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
