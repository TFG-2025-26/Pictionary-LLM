import { createRef } from "react";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DrawingCanvas, {
  type DrawingCanvasRef,
} from "../../src/components/DrawingCanvas/DrawingCanvas";

describe("DrawingCanvas", () => {
  const ctxMock = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    lineCap: "",
    lineWidth: 0,
    strokeStyle: "",
    fillStyle: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(
      HTMLCanvasElement.prototype,
      "getContext"
    ).mockImplementation(() => ctxMock as any);

    vi.spyOn(
      HTMLCanvasElement.prototype,
      "toBlob"
    ).mockImplementation((callback) => {
      callback?.(new Blob(["png"], { type: "image/png" }));
    });
  });

  it("clear limpia el canvas", () => {
    const ref = createRef<DrawingCanvasRef>();

    render(<DrawingCanvas ref={ref} width={300} height={200} />);

    ref.current?.clear();

    expect(ctxMock.clearRect).toHaveBeenCalledWith(0, 0, 300, 200);
  });

  it("getBlob devuelve un PNG", async () => {
    const ref = createRef<DrawingCanvasRef>();

    render(<DrawingCanvas ref={ref} />);

    const blob = await ref.current?.getBlob();

    expect(blob).toBeInstanceOf(Blob);
    expect(blob?.type).toBe("image/png");
  });

  it(
    "drawModel ejecuta SketchRNN sin romper",
    async () => {
      const ref = createRef<DrawingCanvasRef>();

      render(<DrawingCanvas ref={ref} />);

      await ref.current?.drawModel("cat");

      await waitFor(() => {
        expect(ctxMock.clearRect).toHaveBeenCalled();
      });
    },
    15000
  );
});