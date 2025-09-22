import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "./icons";

export type QAItem = { 
  label: string; 
  to: string; 
  icon?: React.ReactNode; 
  onClick?: () => void; 
  caption?: string 
};

function QuickActionsGrid({ items }: { items: QAItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((it, i) => (
        <Link 
          key={i} 
          to={it.to} 
          onClick={it.onClick}
          className={cn(
            "panel-muted px-4 py-3 flex items-center justify-between",
            "hover:dark:bg-white/12 transition"
          )}
        >
          <div className="flex items-center gap-3">
            {it.icon}
            <div>
              <div className="t-primary text-sm font-medium">{it.label}</div>
              {it.caption && <div className="t-dim text-xs">{it.caption}</div>}
            </div>
          </div>
          <ChevronRightIcon />
        </Link>
      ))}
    </div>
  );
}

export default React.memo(QuickActionsGrid);