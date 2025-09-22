import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type QAItem = { 
  label: string; 
  to: string; 
  icon?: React.ReactNode; 
  onClick?: () => void; 
  caption?: string 
};

function QuickActionsGrid({ items }: { items: QAItem[] }) {
  const many = items.length >= 4; // 4+ → 2×2; else 1,1,1…
  return (
    <div className={cn("gap-3 grid", many ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
      {items.map((it, i) => (
        <Link 
          key={i} 
          to={it.to} 
          onClick={it.onClick}
          className={cn("qa-item flex items-center justify-between")}
        >
          <div className="flex items-center gap-3">
            {it.icon}
            <div>
              <div className="t-primary text-sm font-medium">{it.label}</div>
              {it.caption && <div className="t-dim text-xs">{it.caption}</div>}
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" className="t-dim">
            <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </Link>
      ))}
    </div>
  );
}

export default React.memo(QuickActionsGrid);