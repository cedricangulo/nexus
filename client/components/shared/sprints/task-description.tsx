"use client";

export function TaskDescription({ content }: { content: string }) {
  // This component is currently safe as it renders text directly.
  // If markdown support is added later, ensure to use a sanitizer like DOMPurify.
  return (
    <p className="line-clamp-1 text-muted-foreground text-sm">
      {content}
    </p>
  );
}
