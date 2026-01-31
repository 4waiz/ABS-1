import * as React from "react";

import { cn } from "@/lib/utils";

export function PageGrid({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-6 md:grid-cols-12", className)}>
      {children}
    </div>
  );
}
