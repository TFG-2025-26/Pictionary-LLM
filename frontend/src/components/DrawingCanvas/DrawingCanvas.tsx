import { useRef, useState, useImperativeHandle, forwardRef } from "react";

import * as ms from '@magenta/sketch';

const getApiUrl = () => {
  // if (import.meta.env.PROD) {
  //   return "";
  // }

  return `http://${window.location.hostname}:8000`;
}

const API_BASE_URL = getApiUrl();

export interface DrawingCanvasRef {
  clear: () => void;
  getBlob: () => Promise<Blob | null>;
  drawModel: (category: string) => Promise<void>;
}

interface Props {
  width?: number;
  height?: number;
  color?: string;
  lineWidth?: number;
  isEraser?: boolean;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, Props>((props, ref) => {
  const { width = 1000, height = 500, color = "#000000", isEraser = false , lineWidth = 3 } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  

  useImperativeHandle(ref, () => ({
    clear: () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, width, height);
    },
    getBlob: () => {
      return new Promise((resolve) => {
        const canvas = canvasRef.current;
        if (!canvas) return resolve(null);
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = width; tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.fillStyle = "#ffffff";
          tempCtx.fillRect(0, 0, width, height);
          tempCtx.drawImage(canvas, 0, 0);
          tempCanvas.toBlob((b) => resolve(b), "image/png");
        }
      });
    },

    drawModel: async (category: string) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !ms) return;

      ctx.clearRect(0, 0, width, height);

      try {
       
        const modelUrl = `${API_BASE_URL}/static_models/${category}.gen.json`;

        const model = new ms.SketchRNN(modelUrl);

        await model.initialize();
        model.setPixelFactor(3.0);

        let rnn_state = model.zeroState();
        let [dx, dy, p0, p1, p2] = model.zeroInput();
        let x = width / 2;
        let y = height / 3;
        let prev_pen = [1, 0, 0];
        const temperature = 0.45;

        while (prev_pen[2] !== 1) {
          rnn_state = model.update([dx, dy, p0, p1, p2], rnn_state);

          const pdf = model.getPDF(rnn_state, temperature);

          [dx, dy, p0, p1, p2] = model.sample(pdf);

          if (prev_pen[0] === 1) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = "round";
            ctx.moveTo(x, y);
            ctx.lineTo(x + dx, y + dy);
            ctx.stroke();
          }

          
          x += dx;
          y += dy;
          prev_pen = [p0, p1, p2];

          await new Promise(r => setTimeout(r, 20));
          
          if (x < -500 || x > width + 500 || y < -500 || y > height + 500) break;
        }
        console.log("✅ IA ha terminado de dibujar.");
      } catch (err) {
        console.error("Error con SketchRNN:", err);
      }
    }
  }));

  const getPos = (e: any) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineWidth = lineWidth; ctx.lineCap = "round"; ctx.strokeStyle = isEraser ? "#ffffff" : color;;
      ctx.beginPath(); ctx.moveTo(lastPos.x, lastPos.y); ctx.lineTo(x, y); ctx.stroke();
      setLastPos({ x, y });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={(e) => { setLastPos(getPos(e)); setIsDrawing(true); }}
      onMouseMove={draw}
      onMouseUp={() => setIsDrawing(false)}
      onTouchStart={(e) => { setLastPos(getPos(e)); setIsDrawing(true); }}
      onTouchMove={draw}
      onTouchEnd={() => setIsDrawing(false)}
      style={{ background: "white", border: "1px solid #000", cursor: "crosshair" }}
    />
  );
});

export default DrawingCanvas;