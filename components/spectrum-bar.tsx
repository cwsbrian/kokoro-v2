import React from "react";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";

interface SpectrumBarProps {
  label: string;
  value: number;
}

export function SpectrumBar({ label, value }: SpectrumBarProps) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

  return (
    <Box className="gap-1">
      <Box className="flex-row justify-between">
        <Text className="text-xs text-typography-400">{label}</Text>
        <Text className="text-xs text-typography-500">{Math.round(pct)}%</Text>
      </Box>
      <Box className="h-2 rounded-full bg-outline-200 overflow-hidden">
        <Box
          className="h-full rounded-full bg-primary-500"
          style={{ width: `${pct}%` }}
        />
      </Box>
    </Box>
  );
}
