import { describe, expect, it } from "vitest";
import { resolveTooltipCoords } from "./Tooltip.jsx";

const MOBILE_VIEWPORT = { width: 390, height: 844 };

describe("resolveTooltipCoords", () => {
  it("keeps a bottom-aligned tooltip inside the viewport horizontally", () => {
    const triggerRect = {
      left: 320,
      right: 380,
      top: 80,
      bottom: 116,
      width: 60,
      height: 36
    };
    const tooltipRect = { width: 200, height: 72 };

    const coords = resolveTooltipCoords(
      triggerRect,
      tooltipRect,
      "bottom",
      "end",
      MOBILE_VIEWPORT
    );

    expect(coords.left).toBeGreaterThanOrEqual(12);
    expect(coords.left + tooltipRect.width).toBeLessThanOrEqual(MOBILE_VIEWPORT.width - 12);
    expect(coords.top).toBeGreaterThanOrEqual(12);
  });

  it("flips left placement when there is not enough space on the left", () => {
    const triggerRect = {
      left: 24,
      right: 120,
      top: 200,
      bottom: 240,
      width: 96,
      height: 40
    };
    const tooltipRect = { width: 180, height: 64 };

    const coords = resolveTooltipCoords(
      triggerRect,
      tooltipRect,
      "left",
      "start",
      MOBILE_VIEWPORT
    );

    expect(coords.placement).toBe("right");
    expect(coords.left).toBeGreaterThanOrEqual(triggerRect.right);
  });
});
