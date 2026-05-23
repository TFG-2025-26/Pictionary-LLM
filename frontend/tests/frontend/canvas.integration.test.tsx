import { createRef } from "react";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DrawingCanvas, {
  type DrawingCanvasRef,
} from "../../src/components/DrawingCanvas/DrawingCanvas";

type CanvasOp = {
  name: string;
  args?: unknown[];
};

describe("DrawingCanvas integration", () => {
  const ops: CanvasOp[] = [];

  const ctxMock = {
    clearRect: vi.fn((...args: unknown[]) => ops.push({ name: "clearRect", args })),
    fillRect: vi.fn((...args: unknown[]) => ops.push({ name: "fillRect", args })),
    drawImage: vi.fn((...args: unknown[]) => ops.push({ name: "drawImage", args })),
    beginPath: vi.fn(() => ops.push({ name: "beginPath" })),
    moveTo: vi.fn((...args: unknown[]) => ops.push({ name: "moveTo", args })),
    lineTo: vi.fn((...args: unknown[]) => ops.push({ name: "lineTo", args })),
    stroke: vi.fn(() => ops.push({ name: "stroke" })),
    lineCap: "",
    lineWidth: 0,
    strokeStyle: "",
    fillStyle: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    ops.length = 0;

    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      () => ctxMock as any
    );

    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
      (callback) => {
        callback?.(new Blob(["png"], { type: "image/png" }));
      }
    );
  });

  it(
    "drawModel descarga el modelo real y deja trazos en el lienzo",
    async () => {
      const ref = createRef<DrawingCanvasRef>();

      render(<DrawingCanvas ref={ref} width={300} height={200} />);

      expect(ops.filter((op) => op.name === "stroke")).toHaveLength(0);

      await ref.current?.drawModel("cat");

      await waitFor(
        () => {
          expect(ops.filter((op) => op.name === "clearRect").length).toBeGreaterThan(0);
          expect(ops.filter((op) => op.name === "beginPath").length).toBeGreaterThan(0);
          expect(ops.filter((op) => op.name === "moveTo").length).toBeGreaterThan(0);
          expect(ops.filter((op) => op.name === "lineTo").length).toBeGreaterThan(0);
          expect(ops.filter((op) => op.name === "stroke").length).toBeGreaterThan(0);
        },
        { timeout: 20000 }
      );
    },
    25000
  );
});