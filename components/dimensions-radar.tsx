import React from "react";
import { useColorScheme } from "react-native";
import Svg, { Line, Polygon, Text as SvgText } from "react-native-svg";

import { Box } from "@/components/ui/box";

const ANGLE_START_DEG = 90;
const VIEW_PADDING = 36;

function deg2rad(deg: number) {
  return (deg * Math.PI) / 180;
}

export interface DimensionsRadarProps {
  /**
   * 축 이름 → 0~100 점수 (레이더 차트 전용).
   * Requires at least 3 dimensions; fewer will render a fallback message.
   */
  dimensions: Record<string, number>;
  size?: number;
  accentColor?: string;
}

/** 앱 primary-500 (라이트) — 특징 막대·키워드와 동일 */
const PRIMARY_COLOR = "#DB2777";

/**
 * Renders a radar chart for dimension scores. Requires at least 3 dimensions;
 * fewer than 3 will return null (degenerate polygon).
 */
export function DimensionsRadar({
  dimensions,
  size = 220,
  accentColor = PRIMARY_COLOR,
}: DimensionsRadarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const entries = Object.entries(dimensions);
  if (entries.length === 0) return null;
  if (entries.length < 3) return null;

  const fillColor = `${accentColor}40`;
  const strokeColor = accentColor;
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) * 0.78;
  const n = entries.length;
  const angleStep = 360 / n;

  const values = entries.map(([, v]) => Math.max(0, Math.min(100, v)));
  const points = values.map((v, i) => {
    const deg = ANGLE_START_DEG - i * angleStep;
    const rad = deg2rad(deg);
    const d = (v / 100) * r;
    return [cx + d * Math.cos(rad), cy - d * Math.sin(rad)];
  });
  const outlinePoints = values.map((_, i) => {
    const deg = ANGLE_START_DEG - i * angleStep;
    const rad = deg2rad(deg);
    return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)];
  });

  const pointsStr = points.map((p) => p.join(",")).join(" ");
  const outlineStr = outlinePoints.map((p) => p.join(",")).join(" ");

  const labelRadius = r + 24;
  const labelCoords = entries.map(([label], i) => {
    const deg = ANGLE_START_DEG - i * angleStep;
    const rad = deg2rad(deg);
    return {
      x: cx + labelRadius * Math.cos(rad),
      y: cy - labelRadius * Math.sin(rad),
      label,
    };
  });

  const viewSize = size + 2 * VIEW_PADDING;
  return (
    <Box className="items-center">
      <Svg
        width={size}
        height={size}
        viewBox={`${-VIEW_PADDING} ${-VIEW_PADDING} ${viewSize} ${viewSize}`}
      >
        <Polygon
          points={outlineStr}
          fill="none"
          stroke={isDark ? "rgba(248, 250, 252, 0.35)" : "rgba(148, 163, 184, 0.4)"}
          strokeWidth={1}
        />
        <Polygon
          points={pointsStr}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={2}
        />
        {outlinePoints.map((_, i) => (
          <Line
            key={i}
            x1={cx}
            y1={cy}
            x2={outlinePoints[i][0]}
            y2={outlinePoints[i][1]}
            stroke={isDark ? "rgba(248, 250, 252, 0.25)" : "rgba(148, 163, 184, 0.3)"}
            strokeWidth={1}
          />
        ))}
        {labelCoords.map(({ x, y, label }, i) => (
          <SvgText
            key={`${label}-${i}`}
            x={x}
            y={y}
            fill={isDark ? "#f5f5f5" : "#475569"}
            fontSize={15}
            fontWeight="500"
            textAnchor="middle"
          >
            {label}
          </SvgText>
        ))}
      </Svg>
    </Box>
  );
}
