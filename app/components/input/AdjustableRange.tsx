// AdjustableRange.tsx
import React, { useRef, useState } from "react";

type AdjustableRangeProps = {
  min: number;
  max: number;
  step?: number;
  value: [number, number]; // [minValue, maxValue]
  onChange: (value: [number, number]) => void;
};

export const AdjustableRange: React.FC<AdjustableRangeProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [draggingThumb, setDraggingThumb] = useState<"min" | "max" | null>(
    null,
  );

  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  const snap = (v: number) => {
    const snapped = Math.round(v / step) * step;
    return clamp(snapped);
  };

  const valueToPercent = (v: number) => ((v - min) / (max - min || 1)) * 100;

  const updateFromClientX = (clientX: number, thumb: "min" | "max") => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const raw = min + ratio * (max - min);
    const next = snap(raw);

    console.log(value);

    let [curMin, curMax] = value;

    if (thumb === "min") {
      curMin = Math.min(next, curMax); // 交差しないように
    } else {
      curMax = Math.max(next, curMin);
    }

    onChange([curMin, curMax]);
  };

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const clickedValue = min + ratio * (max - min);

    // クリック位置から近い方のつまみを選ぶ
    const [curMin, curMax] = value;
    const distToMin = Math.abs(clickedValue - curMin);
    const distToMax = Math.abs(clickedValue - curMax);
    const thumb: "min" | "max" = distToMin < distToMax ? "min" : "max";

    setDraggingThumb(thumb);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX, thumb);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingThumb) return;
    updateFromClientX(e.clientX, draggingThumb);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingThumb) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setDraggingThumb(null);
  };

  const [curMin, curMax] = value;
  const leftPercent = valueToPercent(curMin);
  const rightPercent = valueToPercent(curMax);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>{curMin}</span>
        <span>{curMax}</span>
      </div>

      <div
        ref={trackRef}
        className="relative h-3 rounded-full bg-gray-200 touch-none select-none"
        onPointerDown={handleTrackPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* 選択範囲ハイライト */}
        <div
          className="absolute h-full rounded-full bg-blue-400"
          style={{
            left: `${leftPercent}%`,
            width: `${rightPercent - leftPercent}%`,
          }}
        />

        {/* 左つまみ */}
        <div
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border border-gray-400 bg-white shadow"
          style={{ left: `${leftPercent}%` }}
          onPointerDown={(e) => {
            e.stopPropagation();
            setDraggingThumb("min");
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />

        {/* 右つまみ */}
        <div
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border border-gray-400 bg-white shadow"
          style={{ left: `${rightPercent}%` }}
          onPointerDown={(e) => {
            e.stopPropagation();
            setDraggingThumb("max");
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </div>
    </div>
  );
};
