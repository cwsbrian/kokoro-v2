import React from "react";
import Svg, { Line, Polygon, Text as SvgText } from "react-native-svg";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";

const LABELS = ["개방성", "성실성", "외향성", "친화성", "신경증"] as const;
const ANGLE_DEG = 90;
const ANGLE_STEP = 72;
/** 라벨이 잘리지 않도록 viewBox 여백 */
const VIEW_PADDING = 32;

function deg2rad(deg: number) {
  return (deg * Math.PI) / 180;
}

const DEFAULT_ACCENT = "#DB2777";

interface BigFiveRadarProps {
  O: number;
  C: number;
  E: number;
  A: number;
  N: number;
  size?: number;
  /** 유형별 색상 (미지정 시 primary 계열) */
  accentColor?: string;
}

export function BigFiveRadar({
  O,
  C,
  E,
  A,
  N,
  size = 200,
  accentColor = DEFAULT_ACCENT,
}: BigFiveRadarProps) {
  const fillColor = `${accentColor}40`;
  const strokeColor = accentColor;
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) * 0.85;

  const values = [O, C, E, A, N];
  const points = values.map((v, i) => {
    const deg = ANGLE_DEG - i * ANGLE_STEP;
    const rad = deg2rad(deg);
    const d = (Math.max(0, Math.min(100, v)) / 100) * r;
    return [cx + d * Math.cos(rad), cy - d * Math.sin(rad)];
  });
  const outlinePoints = [0, 1, 2, 3, 4].map((i) => {
    const deg = ANGLE_DEG - i * ANGLE_STEP;
    const rad = deg2rad(deg);
    return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)];
  });

  const pointsStr = points.map((p) => p.join(",")).join(" ");
  const outlineStr = outlinePoints.map((p) => p.join(",")).join(" ");

  const labelRadius = r + 22;
  const labelCoords = [0, 1, 2, 3, 4].map((i) => {
    const deg = ANGLE_DEG - i * ANGLE_STEP;
    const rad = deg2rad(deg);
    return {
      x: cx + labelRadius * Math.cos(rad),
      y: cy - labelRadius * Math.sin(rad),
      label: LABELS[i],
    };
  });

  const viewSize = size + 2 * VIEW_PADDING;
  return (
    <Box className="items-center gap-4">
      <Svg
        width={size}
        height={size}
        viewBox={`${-VIEW_PADDING} ${-VIEW_PADDING} ${viewSize} ${viewSize}`}
      >
        <Polygon
          points={outlineStr}
          fill="none"
          stroke="rgba(148, 163, 184, 0.4)"
          strokeWidth={1}
        />
        <Polygon
          points={pointsStr}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={2}
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <Line
            key={i}
            x1={cx}
            y1={cy}
            x2={outlinePoints[i][0]}
            y2={outlinePoints[i][1]}
            stroke="rgba(148, 163, 184, 0.3)"
            strokeWidth={1}
          />
        ))}
        {labelCoords.map(({ x, y, label }, i) => (
          <SvgText
            key={label}
            x={x}
            y={y}
            fill="#475569"
            fontSize={12}
            fontWeight="500"
            textAnchor="middle"
          >
            {label}
          </SvgText>
        ))}
      </Svg>
      <Box className="flex-row flex-wrap justify-center gap-x-4 gap-y-1">
        {LABELS.map((label, i) => (
          <Text
            key={label}
            className="text-xs text-typography-600 dark:text-typography-400"
          >
            {label} {Math.round(values[i])}%
          </Text>
        ))}
      </Box>
    </Box>
  );
}
