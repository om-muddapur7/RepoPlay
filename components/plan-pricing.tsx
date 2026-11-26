"use client";

import { PricingTable } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";

export function PlanPricing({ defer }: { defer: boolean }) {
  const placeholder = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!defer);

  useEffect(() => {
    const element = placeholder.current;
    if (!element || visible) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      setVisible(true);
      observer.disconnect();
    }, { rootMargin: "400px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  return visible
    ? <PricingTable for="user" newSubscriptionRedirectUrl="/workspace" />
    : <div className="pricing-placeholder" ref={placeholder} />;
}
