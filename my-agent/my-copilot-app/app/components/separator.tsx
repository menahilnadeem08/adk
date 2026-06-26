///// ===================Separator 
import React from "react";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Separator({ className = "", ...props }: SeparatorProps) {
  return (
    <div role="separator" className={`h-px w-full bg-neutral-200 ${className}`} {...props} />
  );
}
