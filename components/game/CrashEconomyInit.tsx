"use client";

import { useLayoutEffect } from "react";
import { setCrashEconomy } from "@/lib/game/crashStore";

export function CrashEconomyInit({
  realMoney,
  balanceMinor,
}: {
  realMoney: boolean;
  balanceMinor: number;
}) {
  useLayoutEffect(() => {
    setCrashEconomy(realMoney ? "real" : "practice", balanceMinor);
  }, [realMoney, balanceMinor]);

  return null;
}
