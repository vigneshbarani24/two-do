"use client";

import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface TimeTravelSliderProps {
  pointer: number;
  timelineLength: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSeek: (index: number) => void;
}

export function TimeTravelSlider({
  pointer,
  timelineLength,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSeek,
}: TimeTravelSliderProps) {
  if (timelineLength <= 1) return null;

  const max = timelineLength - 1;

  return (
    <div className="border-t bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-4xl px-4 py-3">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <Slider
              value={[pointer]}
              min={0}
              max={max}
              step={1}
              onValueChange={(v) => {
                const next = Array.isArray(v) ? v[0] : v;
                if (typeof next === "number" && next !== pointer) onSeek(next);
              }}
              aria-label="Timeline position"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Redo"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>

          <span className="text-sm text-muted-foreground tabular-nums min-w-[5.5rem] text-right">
            Step {pointer + 1} / {timelineLength}
          </span>
        </div>
      </div>
    </div>
  );
}
