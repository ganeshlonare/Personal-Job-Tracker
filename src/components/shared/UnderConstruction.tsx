"use client";

import { Construction } from "lucide-react";

export function UnderConstruction({ feature }: { feature: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl" 
         style={{ background: "var(--color-card)", border: "1px dashed var(--color-border)" }}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
           style={{ background: "var(--color-secondary)", color: "var(--color-primary)" }}>
        <Construction className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-foreground)" }}>
        {feature} is under construction
      </h2>
      <p className="text-sm max-w-md mx-auto" style={{ color: "var(--color-muted-foreground)" }}>
        This module is currently being built and will be available in the next major update. Stay tuned!
      </p>
    </div>
  );
}
