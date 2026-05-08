// import { useRef, useState, useImperativeHandle, forwardRef } from "react";
// import "./DrawingCanvas.css";

// interface DrawingCanvasProps {
//   width?: number;
//   height?: number;
//   color?: string;
//   lineWidth?: number;
//   isEraser?: boolean;
// }

// export interface DrawingCanvasRef {
//   clear: () => void;
//   getBlob: () => Promise<Blob | null>;
// }

// const DrawingCanvas = forwardRef((props: DrawingCanvasProps, ref) => {
//   const { width = 800, height = 500, color = "#000000", lineWidth = 3, isEraser = false } = props;
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

//   useImperativeHandle(ref, () => ({
//     clear: () => {
//       const canvas = canvasRef.current;
//       const ctx = canvas?.getContext("2d");
//       if (ctx && canvas) {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//       }
//     },
//     getBlob: (): Promise<Blob | null> => {
//       return new Promise((resolve) => {
//         const canvas = canvasRef.current;
//         if (!canvas) return resolve(null);
        
//         // Creación de un canvas temporal para asegurar fondo blanco 
//         const tempCanvas = document.createElement("canvas");
//         tempCanvas.width = canvas.width;
//         tempCanvas.height = canvas.height;
//         const tempCtx = tempCanvas.getContext("2d");
        
//         if (tempCtx) {
//           tempCtx.fillStyle = "#ffffff";
//           tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
//           tempCtx.drawImage(canvas, 0, 0);
//           tempCanvas.toBlob((blob) => resolve(blob), "image/png");
//         }
//       });
//     }//,
//     // drawStroke: (dx: number, dy: number, p1: number) => {
//     //   const canvas = canvasRef.current;
//     //   const ctx = canvas?.getContext("2d");
//     //   if (!ctx) return;

//     //   // Calculamos la nueva posición basada en el incremento (dx, dy)
//     //   // Usamos una variable externa o el estado para saber dónde estaba el "lápiz de la IA"
//     //   const newX = lastPos.x + dx;
//     //   const newY = lastPos.y + dy;

//     //   if (p1 === 0) { // Lápiz apoyado (según estándar Sketch-RNN p1=0 es abajo, p1=1 es arriba)
//     //     ctx.beginPath();
//     //     ctx.strokeStyle = color;
//     //     ctx.lineWidth = lineWidth;
//     //     ctx.lineCap = "round";
//     //     ctx.moveTo(lastPos.x, lastPos.y);
//     //     ctx.lineTo(newX, newY);
//     //     ctx.stroke();
//     //   }

//     //   // Actualizamos la posición para el siguiente trazo
//     //   setLastPos({ x: newX, y: newY });
//     // }
//   }));

//   const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
//     const canvas = canvasRef.current;
//     if (!canvas) return { x: 0, y: 0 };
//     const rect = canvas.getBoundingClientRect();
//     const clientX = "touches" in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
//     const clientY = "touches" in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
//     return { x: clientX - rect.left, y: clientY - rect.top };
//   };

//   const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
//     const { x, y } = getCoordinates(e);
//     setLastPos({ x, y });
//     setIsDrawing(true);
//   };

//   const draw = (e: React.MouseEvent | React.TouchEvent) => {
//     if (!isDrawing) return;
//     const { x, y } = getCoordinates(e);
//     const canvas = canvasRef.current;
//     const ctx = canvas?.getContext("2d");

//     if (ctx) {
//       ctx.beginPath();
//       ctx.strokeStyle = isEraser ? "#ffffff" : color;
//       ctx.lineWidth = lineWidth;
//       ctx.lineCap = "round";
//       ctx.lineJoin = "round";
//       ctx.moveTo(lastPos.x, lastPos.y);
//       ctx.lineTo(x, y);
//       ctx.stroke();
//       setLastPos({ x, y });
//     }
//   };

//   return (
//     <canvas
//       ref={canvasRef}
//       width={width}
//       height={height}
//       className="drawing-canvas"
//       onMouseDown={startDrawing}
//       onMouseMove={draw}
//       onMouseUp={() => setIsDrawing(false)}
//     //   onMouseLeave={() => setIsDrawing(false)} // SEÑALIZACIÓN: Corta el trazo si sales del canvas
//       onTouchStart={startDrawing}
//       onTouchMove={draw}
//       onTouchEnd={() => setIsDrawing(false)}
//     />
//   );
// });

// export default DrawingCanvas;























import { useRef, useState, useImperativeHandle, forwardRef } from "react";

export interface DrawingCanvasRef {
  clear: () => void;
  getBlob: () => Promise<Blob | null>;
}

interface Props {
  width?: number;
  height?: number;
  color?: string;
  lineWidth?: number;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, Props>((props, ref) => {
  const { width = 800, height = 500, color = "#000000", lineWidth = 3 } = props;
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
      ctx.lineWidth = lineWidth; ctx.lineCap = "round"; ctx.strokeStyle = color;
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