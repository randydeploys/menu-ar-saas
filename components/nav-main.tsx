"use client";

import * as React from "react";
import Link from "next/link";
import { IconLock } from "@tabler/icons-react";

type NavItem = {
  title: string;
  url: string;
  icon: any;
  badge?: "Pro";
  disabled?: boolean;
  locked?: boolean;
};

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <div className="px-2">
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;

          const content = (
            <>
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.title}</span>

              {item.badge === "Pro" && (
                <span className="text-[10px] px-2 py-0.5 rounded-full border">
                  Pro
                </span>
              )}

              {item.locked && <IconLock className="h-4 w-4" />}
            </>
          );

          // Disabled item: visible but not clickable
          if (item.disabled) {
            return (
              <div
                key={item.title}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm opacity-50 cursor-not-allowed"
                aria-disabled="true"
              >
                {content}
              </div>
            );
          }

          // Normal item: clickable
          return (
            <Link
              key={item.title}
              href={item.url}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
